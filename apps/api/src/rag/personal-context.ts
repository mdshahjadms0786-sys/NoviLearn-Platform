import { prisma } from "../prisma";
import type { PersonalContext } from "./types";

const MAX_KNOWN_TOPICS = 15;
const MAX_WEAK_TOPICS = 3;

function normalizeTopic(topic: string): string {
  return topic.trim().replace(/\s+/g, " ");
}

/**
 * Owner-scoped personal learning context used to ground tutor answers in the
 * student's own progress. Returns lightweight, deterministic data.
 */
export async function buildPersonalContext(userId: string): Promise<PersonalContext> {
  const [learned, practiced, weak] = await Promise.all([
    prisma.learningActivity.findMany({
      where: { userId },
      select: { topic: true },
      distinct: ["topic"],
    }),
    prisma.practiceSession.findMany({
      where: { userId },
      select: { topic: true },
      distinct: ["topic"],
    }),
    prisma.practiceSession.groupBy({
      by: ["topic"],
      where: { userId },
      _min: { accuracy: true },
    }),
  ]);

  const weakTopics = (weak ?? [])
    .filter((entry) => entry._min?.accuracy !== null && (entry._min?.accuracy ?? 100) < 70)
    .sort((a, b) => (a._min?.accuracy ?? 100) - (b._min?.accuracy ?? 100))
    .slice(0, MAX_WEAK_TOPICS)
    .map((entry) => normalizeTopic(entry.topic));

  const knownTopics = [
    ...new Set(
      [...learned.map((item) => normalizeTopic(item.topic)), ...practiced.map((item) => normalizeTopic(item.topic))].filter(
        (topic) => topic.length > 0,
      ),
    ),
  ].slice(0, MAX_KNOWN_TOPICS);

  return {
    knownTopics,
    practicedTopics: [...new Set(practiced.map((item) => normalizeTopic(item.topic)))].slice(0, MAX_KNOWN_TOPICS),
    weakTopics,
  };
}