export function formatDateTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
export function truncateTopic(topic, maxLength = 64) {
  const trimmed = topic.trim();
  return trimmed.length > maxLength
    ? `${trimmed.slice(0, maxLength - 1).trimEnd()}…`
    : trimmed;
}
