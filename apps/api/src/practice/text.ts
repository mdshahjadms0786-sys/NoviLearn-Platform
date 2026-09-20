export function normalizeMatchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ").trim();
}

export function normalizeAnswerText(value: string): string {
  return normalizeMatchText(value).replace(/[!?,.;]+$/g, "");
}
