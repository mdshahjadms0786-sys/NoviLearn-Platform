import { AppError } from "../errors.js";
import { prisma } from "../prisma.js";
import { computeMastery, computeTopicProgress } from "./calculations.js";
import { buildSuggestions } from "./personalization.js";
import { upsertTopic } from "./topics.js";
import { normalizeTopic } from "../utils/topic.js";
const RECENT_ACTIVITY_LIMIT = 10;
const RELATED_NEXT_LIST_LIMIT = 6;
export { normalizeTopic };
function sanitizeStringList(value, limit) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item) => typeof item === "string" && item.trim().length > 0)
    .slice(0, limit);
}
export async function recordLearningActivity(
  userId,
  question,
  relatedConcepts,
  nextLearning,
) {
  const related = sanitizeStringList(relatedConcepts, RELATED_NEXT_LIST_LIMIT);
  const next = sanitizeStringList(nextLearning, RELATED_NEXT_LIST_LIMIT);
  const metadata =
    related.length > 0 || next.length > 0
      ? {
          ...(related.length > 0
            ? {
                related,
              }
            : {}),
          ...(next.length > 0
            ? {
                next,
              }
            : {}),
        }
      : undefined;
  await prisma.learningActivity.create({
    data: {
      userId,
      topic: normalizeTopic(question),
      type: "learn",
      ...(metadata !== undefined
        ? {
            metadata,
          }
        : {}),
    },
  });
  await upsertTopic(normalizeTopic(question));
}
function toLearningActivity(row) {
  return {
    id: row.id,
    topic: row.topic,
    type: "learn",
    createdAt: row.createdAt.toISOString(),
  };
}
function toPracticeSummary(row) {
  return {
    id: row.id,
    topic: row.topic,
    questionCount: row.questionCount,
    difficulty: row.difficulty,
    questionType: row.questionType,
    totalQuestions: row.totalQuestions,
    correctAnswers: row.correctAnswers,
    incorrectAnswers: row.incorrectAnswers,
    accuracy: row.accuracy,
    score: row.score,
    completedAt: row.completedAt.toISOString(),
  };
}
export async function listLearningHistory(userId, limit) {
  const rows = await prisma.learningActivity.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      topic: true,
      type: true,
      createdAt: true,
    },
  });
  return rows.map(toLearningActivity);
}
export async function listPracticeHistory(userId, limit) {
  const rows = await prisma.practiceSession.findMany({
    where: {
      userId,
    },
    orderBy: {
      completedAt: "desc",
    },
    take: limit,
  });
  return rows.map(toPracticeSummary);
}
function stringOrEmpty(value) {
  return typeof value === "string" ? value : "";
}
function parseResults(results) {
  if (!Array.isArray(results)) {
    return [];
  }
  const rows = [];
  for (const candidate of results) {
    if (
      typeof candidate !== "object" ||
      candidate === null ||
      Array.isArray(candidate)
    ) {
      continue;
    }
    const item = candidate;
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
export async function getPracticeHistoryDetail(userId, sessionId) {
  const row = await prisma.practiceSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });
  if (row === null) {
    throw new AppError(
      404,
      "PRACTICE_SESSION_NOT_FOUND",
      "This practice session could not be found.",
    );
  }
  return {
    ...toPracticeSummary(row),
    results: parseResults(row.results),
  };
}
export async function getProgressSummary(userId) {
  const [
    learningActivityCount,
    practiceSessionCount,
    learningGroups,
    practiceGroups,
    totals,
    recentLearning,
    recentPractice,
  ] = await Promise.all([
    prisma.learningActivity.count({
      where: {
        userId,
      },
    }),
    prisma.practiceSession.count({
      where: {
        userId,
      },
    }),
    prisma.learningActivity.groupBy({
      by: ["topic"],
      where: {
        userId,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.practiceSession.groupBy({
      by: ["topic"],
      where: {
        userId,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.practiceSession.aggregate({
      where: {
        userId,
      },
      _sum: {
        totalQuestions: true,
        correctAnswers: true,
      },
      _avg: {
        accuracy: true,
      },
    }),
    prisma.learningActivity.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: RECENT_ACTIVITY_LIMIT * 2,
      select: {
        id: true,
        topic: true,
        createdAt: true,
      },
    }),
    prisma.practiceSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        completedAt: "desc",
      },
      take: RECENT_ACTIVITY_LIMIT * 2,
      select: {
        id: true,
        topic: true,
        completedAt: true,
      },
    }),
  ]);
  const recentActivity = [
    ...recentLearning.map((row) => ({
      id: row.id,
      type: "learn",
      topic: row.topic,
      at: row.createdAt.toISOString(),
    })),
    ...recentPractice.map((row) => ({
      id: row.id,
      type: "practice",
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
  const uniqueTopics = new Set();
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
export async function getTopicProgress(userId) {
  const [learningGroups, practiceGroups] = await Promise.all([
    prisma.learningActivity.groupBy({
      by: ["topic"],
      where: {
        userId,
      },
      _count: {
        _all: true,
      },
      _max: {
        createdAt: true,
      },
    }),
    prisma.practiceSession.groupBy({
      by: ["topic"],
      where: {
        userId,
      },
      _count: {
        _all: true,
      },
      _max: {
        accuracy: true,
        completedAt: true,
      },
      _avg: {
        accuracy: true,
      },
    }),
  ]);
  const practiceByTopic = new Map();
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
  const topics = new Map();
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
  const result = [...topics.entries()].map(([topic, stats]) => {
    const lastLearning = stats.lastLearningAt?.getTime() ?? 0;
    const lastPractice = stats.lastPracticeAt?.getTime() ?? 0;
    const mastery = computeMastery(stats);
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
  });
  result.sort((a, b) =>
    a.lastActivityAt < b.lastActivityAt
      ? 1
      : a.lastActivityAt > b.lastActivityAt
        ? -1
        : 0,
  );
  return result;
}
export async function getSuggestions(userId) {
  const [
    recentLearning,
    recentPractice,
    practiceGroups,
    recentLearningWithMetadata,
  ] = await Promise.all([
    prisma.learningActivity.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
      select: {
        topic: true,
        createdAt: true,
      },
    }),
    prisma.practiceSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 50,
      select: {
        topic: true,
        completedAt: true,
      },
    }),
    prisma.practiceSession.groupBy({
      by: ["topic"],
      where: {
        userId,
      },
      _count: {
        _all: true,
      },
      _max: {
        accuracy: true,
        completedAt: true,
      },
      _avg: {
        accuracy: true,
      },
    }),
    prisma.learningActivity.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
      select: {
        metadata: true,
        createdAt: true,
      },
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
  const relatedNextTopics = [];
  for (const activity of recentLearningWithMetadata) {
    const related = extractMetadataStrings(activity.metadata, "related");
    const next = extractMetadataStrings(activity.metadata, "next");
    for (const topic of [...related, ...next]) {
      relatedNextTopics.push({
        topic,
        at: activity.createdAt,
      });
    }
  }
  relatedNextTopics.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  const masteredTopics = new Set();
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
function extractMetadataStrings(metadata, key) {
  if (
    metadata === null ||
    typeof metadata !== "object" ||
    Array.isArray(metadata)
  ) {
    return [];
  }
  const object = metadata;
  return sanitizeStringList(object[key], RELATED_NEXT_LIST_LIMIT);
}
