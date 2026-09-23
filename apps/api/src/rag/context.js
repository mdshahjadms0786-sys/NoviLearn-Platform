const MAX_EXCERPT_CHARS = 240;
function excerpt(content) {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= MAX_EXCERPT_CHARS) {
    return compact;
  }
  return `${compact.slice(0, MAX_EXCERPT_CHARS).trimEnd()}…`;
}
export function toKnowledgeSources(chunks) {
  return chunks.map((chunk) => ({
    title: chunk.title,
    topic: chunk.topic,
    source: chunk.source,
    excerpt: excerpt(chunk.content),
    confidence: Math.round((chunk.similarity ?? 0) * 100) / 100,
  }));
}
function formatPersonalContext(personal) {
  const lines = [];
  if (personal.knownTopics.length > 0) {
    lines.push(
      `Topics this learner has studied before: ${personal.knownTopics.join(", ")}.`,
    );
  }
  if (personal.practicedTopics.length > 0) {
    lines.push(
      `Topics this learner has practiced: ${personal.practicedTopics.join(", ")}.`,
    );
  }
  if (personal.weakTopics.length > 0) {
    lines.push(
      `The learner struggled with: ${personal.weakTopics.join(", ")}. Prefer explaining these from first principles.`,
    );
  }
  return lines.join("\n");
}
export function buildSystemContext(sources, personal) {
  const sections = [];
  if (sources.length > 0) {
    const sourceLines = sources.map(
      (source, index) =>
        `[${index + 1}] "${source.title}" (topic: ${source.topic}, source: ${source.source}, confidence: ${source.confidence})\n${source.excerpt}`,
    );
    sections.push(
      `The following knowledge was retrieved to help answer the student. Use it as the primary factual basis and do not contradict it unless clearly wrong. Cite a retrieved source by its bracketed number when it shapes your answer. Never invent citations beyond these.\n\n${sourceLines.join("\n\n")}`,
    );
  }
  const personalText = formatPersonalContext(personal);
  if (personalText.length > 0) {
    sections.push(
      `Learner context (use it to calibrate explanations, never repeat it back as a list):\n${personalText}`,
    );
  }
  return sections.join("\n\n");
}
export function buildGroundingPrompt(question, systemContext) {
  if (systemContext.trim().length === 0) {
    return `Student question: ${question.trim()}\n\nReturn the JSON answer object.`;
  }
  return `Student question: ${question.trim()}\n\nRetrieved context is provided in the system message above.\n\nReturn the JSON answer object.`;
}
