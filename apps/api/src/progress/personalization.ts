import type { NextLearningSuggestion } from "@novilearn/types";

import { slugifyTopic } from "../utils/topic";

export interface PersonalizationCandidate {
  topic: string;
  at: Date;
}

export interface WeakTopicCandidate {
  topic: string;
  bestAccuracy: number;
  at: Date;
}

export interface PersonalizationInput {
  recentLearning: PersonalizationCandidate[];
  recentPractice: PersonalizationCandidate[];
  weakTopics: WeakTopicCandidate[];
  relatedNextTopics: PersonalizationCandidate[];
  masteredTopics: ReadonlySet<string>;
}

function mostRecent<T extends { at: Date }>(candidates: T[]): T[] {
  return [...candidates].sort((a, b) =>
    a.at > b.at ? -1 : a.at < b.at ? 1 : 0,
  );
}

function mostRecentWithinWeakest<T extends WeakTopicCandidate>(candidates: T[]): T[] {
  return [...candidates].sort(
    (a, b) =>
      a.bestAccuracy - b.bestAccuracy ||
      (a.at > b.at ? -1 : a.at < b.at ? 1 : 0),
  );
}

/**
 * Dedupe by normalized slug so aliases ("Cell division", "cell division")
 * are treated as the same topic while preserving order of the first occurrence.
 */
function dedupeBySlug<T extends { topic: string }>(candidates: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const candidate of candidates) {
    const slug = slugifyTopic(candidate.topic);
    if (seen.has(slug)) {
      continue;
    }
    seen.add(slug);
    result.push(candidate);
  }
  return result;
}

function firstNotMastered(
  candidates: PersonalizationCandidate[],
  mastered: ReadonlySet<string>,
): PersonalizationCandidate | undefined {
  return (
    candidates.find((candidate) => !mastered.has(candidate.topic)) ??
    candidates[0]
  );
}

export function buildSuggestions(
  input: PersonalizationInput,
): NextLearningSuggestion[] {
  const suggestions: NextLearningSuggestion[] = [];
  const usedSlugs = new Set<string>();

  const firstUnused = (
    candidates: Array<{ topic: string }>,
  ): { topic: string } | undefined => {
    const unused = candidates.find((candidate) => !usedSlugs.has(slugifyTopic(candidate.topic)));
    return unused ?? candidates[0];
  };

  const continueCandidates = dedupeBySlug(
    mostRecent(input.recentLearning),
  );
  const continueTopic = firstNotMastered(
    continueCandidates,
    input.masteredTopics,
  );
  if (continueTopic !== undefined) {
    usedSlugs.add(slugifyTopic(continueTopic.topic));
    suggestions.push({
      kind: "continue_learning",
      title: "Continue learning",
      description: `Pick up where you left off with ${continueTopic.topic}.`,
      topic: continueTopic.topic,
    });
  }

  const practiceTopic = firstUnused(
    dedupeBySlug(mostRecent(input.recentPractice)),
  );
  if (practiceTopic !== undefined) {
    usedSlugs.add(slugifyTopic(practiceTopic.topic));
    suggestions.push({
      kind: "practice_again",
      title: "Practice again",
      description: `Review and strengthen your skills in ${practiceTopic.topic}.`,
      topic: practiceTopic.topic,
    });
  }

  const weakTopic = firstUnused(
    dedupeBySlug(mostRecentWithinWeakest(input.weakTopics)),
  );
  if (weakTopic !== undefined) {
    usedSlugs.add(slugifyTopic(weakTopic.topic));
    suggestions.push({
      kind: "review_weak_topic",
      title: "Review a weak topic",
      description: `${weakTopic.topic} needs a little more attention (best ${(weakTopic as WeakTopicCandidate).bestAccuracy}%).`,
      topic: weakTopic.topic,
    });
  }

  const relatedTopic = firstUnused(
    dedupeBySlug(mostRecent(input.relatedNextTopics)),
  );
  if (relatedTopic !== undefined) {
    suggestions.push({
      kind: "related_next_topic",
      title: "Explore a new topic",
      description: `You may enjoy learning about ${relatedTopic.topic} next.`,
      topic: relatedTopic.topic,
    });
  }

  return suggestions;
}