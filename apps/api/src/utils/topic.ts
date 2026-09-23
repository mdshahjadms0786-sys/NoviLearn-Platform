const TOPIC_MAX_LENGTH = 500;

export function normalizeTopic(topic: string): string {
  return topic
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .slice(0, TOPIC_MAX_LENGTH);
}

export function slugifyTopic(topic: string): string {
  return normalizeTopic(topic)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}