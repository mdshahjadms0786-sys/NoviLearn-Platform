export function normalizeMatchText(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ").trim();
}
export function normalizeAnswerText(value) {
  return normalizeMatchText(value).replace(/[!?,.;]+$/g, "");
}
