import { Prisma } from "@prisma/client";

import type {
  LearningActivity,
  MasteryState,
  NextLearningSuggestion,
  PracticeDifficulty,
  PracticeHistoryResultRow,
  PracticeQuestionMode,
  PracticeSessionDetail,
  PracticeSessionSummary,
  ProgressSummary,
  RecentActivityItem,
  TopicProgress,
} from "@novilearn/types";

import { AppError } from "../errors";
import { prisma } from "../prisma";
import { computeMastery, computeTopicProgress } from "./calculations";
import { buildSuggestions } from "./personalization";
import { upsertTopic } from "./topics";
import { normalizeTopic } from "../utils/topic";

const RECENT_ACTIVITY_LIMIT = 10;
const RELATED_NEXT_LIST_LIMIT = 6;

export { normalizeTopic };

function sanitizeStringList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    )
    .slice(0, limit);
}

export async function recordLearningActivity(
  userId: string,
  question: string,
  relatedConcepts?: string[],
  nextLearning?: string[],
): Promise<void> {
  const related = sanitizeStringList(relatedConcepts, RELATED_NEXT_LIST_LIMIT);
  const next = sanitizeStringList(nextLearning, RELATED_NEXT_LIST_LIMIT);

  const metadata: Prisma.InputJsonValue | undefined =
    related.length > 0 || next.length > 0
      ? {
          ...(related.length > 0 ? { related } : {}),
          ...(next.length > 0 ? { next } : {}),
        }
      : undefined;

  await prisma.learningActivity.create({
    data: {
      userId,
      topic: normalizeTopic(question),
      type: "learn",
      ...(metadata !== undefined ? { metadata } : {}),
    },
  });

  await upsertTopic(normalizeTopic(question));
}

interface LearningActivityRow {
  id: string;
  topic: string;
  type: string;
  createdAt: Date;
}

function toLearningActivity(row: LearningActivityRow): LearningActivity {
  return {
    id: row.id,
    topic: row.topic,
    type: "learn",
    createdAt: row.createdAt.toISOString(),
  };
}

interface PracticeSessionRow {
  id: string;
  topic: string;
  questionCount: number;
  difficulty: string;
  questionType: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  score: number;
  completedAt: Date;
}

function toPracticeSummary(row: PracticeSessionRow): PracticeSessionSummary {
  return {
    id: row.id,
    topic: row.topic,
    questionCount: row.questionCount,
    difficulty: row.difficulty as PracticeDifficulty,
    questionType: row.questionType as PracticeQuestionMode,
    totalQuestions: row.totalQuestions,
    correctAnswers: row.correctAnswers,
    incorrectAnswers: row.incorrectAnswers,
    accuracy: row.accuracy,
    score: row.score,
    completedAt: row.completedAt.toISOString(),
  };
}

export async function listLearningHistory(
  userId: string,
  limit: number,
): Promise<LearningActivity[]> {
  const rows = await prisma.learningActivity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, topic: true, type: true, createdAt: true },
  });
  return rows.map(toLearningActivity);
}

export async function listPracticeHistory(
  userId: string,
  limit: number,
): Promise<PracticeSessionSummary[]> {
  const rows = await prisma.practiceSession.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take: limit,
  });
  return rows.map(toPracticeSummary);
}

function stringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseResults(results: Prisma.JsonValue): PracticeHistoryResultRow[] {
  if (!Array.isArray(results)) {
    return [];
  }
  const rows: PracticeHistoryResultRow[] = [];
  for (const candidate of results) {
    if (
      typeof candidate !== "object" ||
      candidate === null ||
      Array.isArray(candidate)
    ) {
      continue;
    }
    const item = candidate as Record<string, unknown>;
    const type = item.type;
    rows.push({
      questionId: stringOrEmpty(item.questionId),
      question: stringOrEmpty(item.question),
      type:
        type === "mcq" || type === "true_false" || type === "short_answer"
          ? type
          : "mcq",
      correct: item.correct === true,
      answer: stringOrEmpty(item.answer),
      correctAnswer: stringOrEmpty(item.correctAnswer),
      explanation: stringOrEmpty(item.explanation),
    });
  }
  return rows;
}

export async function getPracticeHistoryDetail(
  userId: string,
  sessionId: string,
): Promise<PracticeSessionDetail> {
  const row = await prisma.practiceSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (row === null) {
    throw new AppError(
      404,
      "PRACTICE_SESSION_NOT_FOUND",
      "This practice session could not be found.",
    );
  }
  return { ...toPracticeSummary(row), results: parseResults(row.results) };
}

export async function getProgressSummary(
  userId: string,
): Promise<ProgressSummary> {
  const [
    learningActivityCount,
    practiceSessionCount,
    learningGroups,
    practiceGroups,
    totals,
    recentLearning,
    recentPractice,
  ] = await Promise.all([
    prisma.learningActivity.count({ where: { userId } }),
    prisma.practiceSession.count({ where: { userId } }),
    prisma.learningActivity.groupBy({
      by: ["topic"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.practiceSession.groupBy({
      by: ["topic"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.practiceSession.aggregate({
      where: { userId },
      _sum: { totalQuestions: true, correctAnswers: true },
      _avg: { accuracy: true },
    }),
    prisma.learningActivity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: RECENT_ACTIVITY_LIMIT * 2,
      select: { id: true, topic: true, createdAt: true },
    }),
    prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: RECENT_ACTIVITY_LIMIT * 2,
      select: { id: true, topic: true, completedAt: true },
    }),
  ]);

  const recentActivity: RecentActivityItem[] = [
    ...recentLearning.map((row) => ({
      id: row.id,
      type: "learn" as const,
      topic: row.topic,
      at: row.createdAt.toISOString(),
    })),
    ...recentPractice.map((row) => ({
      id: row.id,
      type: "practice" as const,
      topic: row.topic,
      at: row.completedAt.toISOString(),
    })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    .slice(0, RECENT_ACTIVITY_LIMIT);

  const averageAccuracy =
    totals._avg.accuracy === null
      ? null
      : Math.round(totals._avg.accuracy * 10) / 10;

  const uniqueTopics = new Set<string>();
  for (const group of learningGroups) {
    uniqueTopics.add(group.topic);
  }
  for (const group of practiceGroups) {
    uniqueTopics.add(group.topic);
  }

  return {
    learningActivityCount,
    practiceSessionCount,
    uniqueTopicCount: uniqueTopics.size,
    learnedTopicCount: learningGroups.length,
    practicedTopicCount: practiceGroups.length,
    totalAnswers: totals._sum.totalQuestions ?? 0,
    totalCorrectAnswers: totals._sum.correctAnswers ?? 0,
    averageAccuracy,
    recentActivity,
  };
}

interface TopicGroupStats {
  learningCount: number;
  practiceCount: number;
  bestAccuracy: number | null;
  averageAccuracy: number | null;
  lastLearningAt: Date | null;
  lastPracticeAt: Date | null;
}

export async function getTopicProgress(
  userId: string,
): Promise<TopicProgress[]> {
  const [learningGroups, practiceGroups] = await Promise.all([
    prisma.learningActivity.groupBy({
      by: ["topic"],
      where: { userId },
      _count: { _all: true },
      _max: { createdAt: true },
    }),
    prisma.practiceSession.groupBy({
      by: ["topic"],
      where: { userId },
      _count: { _all: true },
      _max: { accuracy: true, completedAt: true },
      _avg: { accuracy: true },
    }),
  ]);

  const practiceByTopic = new Map<string, TopicGroupStats>();
  for (const group of practiceGroups) {
    practiceByTopic.set(group.topic, {
      learningCount: 0,
      practiceCount: group._count._all,
      bestAccuracy: group._max.accuracy ?? null,
      averageAccuracy:
        group._avg.accuracy === null ? null : Math.round(group._avg.accuracy),
      lastLearningAt: null,
      lastPracticeAt: group._max.completedAt,
    });
  }

  const topics = new Map<string, TopicGroupStats>();
  for (const group of learningGroups) {
    const existing = topics.get(group.topic);
    topics.set(group.topic, {
      learningCount: group._count._all,
      practiceCount: existing?.practiceCount ?? 0,
      bestAccuracy: existing?.bestAccuracy ?? null,
      averageAccuracy: existing?.averageAccuracy ?? null,
      lastLearningAt: group._max.createdAt,
      lastPracticeAt: existing?.lastPracticeAt ?? null,
    });
  }
  for (const [topic, stats] of practiceByTopic) {
    const existing = topics.get(topic);
    if (existing === undefined) {
      topics.set(topic, stats);
    } else {
      existing.practiceCount = stats.practiceCount;
      existing.bestAccuracy = stats.bestAccuracy;
      existing.averageAccuracy = stats.averageAccuracy;
      existing.lastPracticeAt = stats.lastPracticeAt;
    }
  }

  const result: TopicProgress[] = [...topics.entries()].map(
    ([topic, stats]) => {
      const lastLearning = stats.lastLearningAt?.getTime() ?? 0;
      const lastPractice = stats.lastPracticeAt?.getTime() ?? 0;
      const mastery: MasteryState = computeMastery(stats);
      return {
        topic,
        learningCount: stats.learningCount,
        practiceCount: stats.practiceCount,
        bestAccuracy: stats.bestAccuracy,
        averageAccuracy: stats.averageAccuracy,
        mastery,
        progress: computeTopicProgress(stats),
        lastActivityAt: new Date(
          Math.max(lastLearning, lastPractice),
        ).toISOString(),
      };
    },
  );

  result.sort((a, b) =>
    a.lastActivityAt < b.lastActivityAt
      ? 1
      : a.lastActivityAt > b.lastActivityAt
        ? -1
        : 0,
  );

  return result;
}

export async function getSuggestions(
  userId: string,
): Promise<NextLearningSuggestion[]> {
  const [
    recentLearning,
    recentPractice,
    practiceGroups,
    recentLearningWithMetadata,
  ] = await Promise.all([
    prisma.learningActivity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { topic: true, createdAt: true },
    }),
    prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 50,
      select: { topic: true, completedAt: true },
    }),
    prisma.practiceSession.groupBy({
      by: ["topic"],
      where: { userId },
      _count: { _all: true },
      _max: { accuracy: true, completedAt: true },
      _avg: { accuracy: true },
    }),
    prisma.learningActivity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { metadata: true, createdAt: true },
    }),
  ]);

  const recentLearningCandidates = recentLearning.map((row) => ({
    topic: row.topic,
    at: row.createdAt,
  }));

  const recentPracticeCandidates = recentPractice.map((row) => ({
    topic: row.topic,
    at: row.completedAt,
  }));

  const weakTopics = practiceGroups
    .filter((group) => group._max.accuracy !== null && group._max.accuracy < 80)
    .map((group) => ({
      topic: group.topic,
      bestAccuracy: group._max.accuracy ?? 0,
      at: group._max.completedAt ?? new Date(0),
    }))
    .sort((a, b) =>
      a.bestAccuracy === b.bestAccuracy
        ? a.at > b.at
          ? 1
          : -1
        : a.bestAccuracy - b.bestAccuracy,
    );

  const relatedNextTopics: Array<{ topic: string; at: Date }> = [];
  for (const activity of recentLearningWithMetadata) {
    const related = extractMetadataStrings(activity.metadata, "related");
    const next = extractMetadataStrings(activity.metadata, "next");
    for (const topic of [...related, ...next]) {
      relatedNextTopics.push({ topic, at: activity.createdAt });
    }
  }
  relatedNextTopics.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));

  const masteredTopics = new Set<string>();
  for (const group of practiceGroups) {
    const stats = {
      learningCount: 0,
      practiceCount: group._count._all,
      bestAccuracy: group._max.accuracy,
      averageAccuracy:
        group._avg.accuracy === null ? null : Math.round(group._avg.accuracy),
    };
    if (computeMastery(stats) === "STRONG") {
      masteredTopics.add(group.topic);
    }
  }

  return buildSuggestions({
    recentLearning: recentLearningCandidates,
    recentPractice: recentPracticeCandidates,
    weakTopics,
    relatedNextTopics,
    masteredTopics,
  });
}

function extractMetadataStrings(
  metadata: Prisma.JsonValue | null,
  key: "related" | "next",
): string[] {
  if (
    metadata === null ||
    typeof metadata !== "object" ||
    Array.isArray(metadata)
  ) {
    return [];
  }
  const object = metadata as Record<string, unknown>;
  return sanitizeStringList(object[key], RELATED_NEXT_LIST_LIMIT);
}
