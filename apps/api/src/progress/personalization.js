import { slugifyTopic } from "../utils/topic.js";
function mostRecent(candidates) {
  return [...candidates].sort((a, b) =>
    a.at > b.at ? -1 : a.at < b.at ? 1 : 0,
  );
}
function mostRecentWithinWeakest(candidates) {
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
function dedupeBySlug(candidates) {
  const seen = new Set();
  const result = [];
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
function firstNotMastered(candidates, mastered) {
  return (
    candidates.find((candidate) => !mastered.has(candidate.topic)) ??
    candidates[0]
  );
}
export function buildSuggestions(input) {
  const suggestions = [];
  const usedSlugs = new Set();
  const firstUnused = (candidates) => {
    const unused = candidates.find(
      (candidate) => !usedSlugs.has(slugifyTopic(candidate.topic)),
    );
    return unused ?? candidates[0];
  };
  const continueCandidates = dedupeBySlug(mostRecent(input.recentLearning));
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
      description: `${weakTopic.topic} needs a little more attention (best ${weakTopic.bestAccuracy}%).`,
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
