import type { LanguageModelConfig, LanguageModelMessage } from "../src/ai/ai.types";
import { localEmbedInputs } from "../src/ai/embeddings/local";
import {
  buildOpenAiEmbeddingRequest,
  parseOpenAiEmbeddingResponse,
} from "../src/ai/embeddings/providers/openai.embeddings";
import { buildTutorMessages } from "../src/ai/prompts/system";
import { buildAnthropicRequest, parseAnthropicResponse } from "../src/ai/providers/anthropic.provider";
import { buildSuggestions, type PersonalizationInput } from "../src/progress/personalization";
import { toChunkInputs, splitIntoChunks } from "../src/rag/chunking";
import { toKnowledgeSources } from "../src/rag/context";
import { cosineSimilarity } from "../src/rag/vector";
import { slugifyTopic } from "../src/utils/topic";

let passed = 0;
let failed = 0;

function check(description: string, actual: unknown, expected: unknown): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson === expectedJson) {
    passed += 1;
    console.log(`  ok ${description}`);
  } else {
    failed += 1;
    console.error(`FAIL ${description}`);
    console.error(`  expected ${expectedJson}`);
    console.error(`  received ${actualJson}`);
  }
}

function checkTrue(description: string, value: boolean, context?: unknown): void {
  if (value) {
    passed += 1;
    console.log(`  ok ${description}`);
  } else {
    failed += 1;
    console.error(`FAIL ${description}`);
    if (context !== undefined) {
      console.error(`  context: ${JSON.stringify(context).slice(0, 400)}`);
    }
  }
}

const MESSAGES: LanguageModelMessage = {
  system: "You are a tutor.",
  user: "Student question: What is photosynthesis?",
};

const SETTINGS: LanguageModelConfig = {
  provider: "anthropic",
  apiKey: "sk-ant-test",
  model: "claude-sonnet-4",
  maxTokens: 512,
  temperature: 0.4,
  timeoutMs: 30_000,
};

console.log("buildAnthropicRequest (provider-agnostic request mapping)");
const request = buildAnthropicRequest(MESSAGES, SETTINGS);
check("model forwarded", request.model, "claude-sonnet-4");
check("max_tokens forwarded", request.max_tokens, 512);
check("temperature forwarded", request.temperature, 0.4);
check("system prompt used as system", request.system, "You are a tutor.");
check(
  "user turn carries the student message single role",
  request.messages,
  [{ role: "user", content: "Student question: What is photosynthesis?" }],
);

console.log("parseAnthropicResponse (message content extraction)");
check(
  "extracts first text block",
  parseAnthropicResponse({ content: [{ type: "text", text: "hello" }] }),
  "hello",
);
check(
  "skips non-text blocks",
  parseAnthropicResponse({
    content: [{ type: "tool_use", id: "t" }, { type: "text", text: "found" }],
  }),
  "found",
);
check("non-object body -> null", parseAnthropicResponse("nope"), null);
check("null body -> null", parseAnthropicResponse(null), null);
check("missing content -> null", parseAnthropicResponse({}), null);
check("non-array content -> null", parseAnthropicResponse({ content: "x" }), null);
check("empty content -> null", parseAnthropicResponse({ content: [] }), null);
check(
  "text block without text -> null",
  parseAnthropicResponse({ content: [{ type: "text" }] }),
  null,
);

console.log("buildOpenAiEmbeddingRequest");
check("model + input mapped", buildOpenAiEmbeddingRequest("text-embedding-3-small", ["a", "b"]), {
  model: "text-embedding-3-small",
  input: ["a", "b"],
});

console.log("parseOpenAiEmbeddingResponse");
const reorderedBody = {
  data: [
    { index: 1, embedding: [0, 1] },
    { index: 0, embedding: [2, 3] },
  ],
};
check(
  "orders vectors by index not arrival order",
  parseOpenAiEmbeddingResponse(reorderedBody, 2),
  [
    [2, 3],
    [0, 1],
  ],
);
check("wrong count -> null", parseOpenAiEmbeddingResponse(reorderedBody, 3), null);
check("missing data -> null", parseOpenAiEmbeddingResponse({}, 1), null);
check(
  "non-numeric embedding entry -> null",
  parseOpenAiEmbeddingResponse({ data: [{ index: 0, embedding: [1, "x"] }] }, 1),
  null,
);

console.log("localEmbedInputs (deterministic dev/test embedding)");
const dim = 64;
const longText = "Photosynthesis is the process plants use to convert light energy.";
const vectors = localEmbedInputs([longText, longText], dim);
checkTrue("one vector per input", vectors.length === 2);
checkTrue(
  "vector dimension matches config",
  vectors[0]?.length === dim && vectors[1]?.length === dim,
);
check(
  "identical inputs produce identical vectors",
  vectors[0],
  vectors[1],
);
const norm = Math.sqrt(
  (vectors[0] ?? []).reduce((sum, value) => sum + value * value, 0),
);
checkTrue("vectors are unit normalized", Math.abs(norm - 1) < 1e-9, norm);
const emptyVector = localEmbedInputs(["!!!"], dim)[0];
checkTrue(
  "no tokens -> zero vector (norm 0)",
  (emptyVector ?? []).every((value) => value === 0),
);

console.log("cosineSimilarity");
check("identical vectors -> 1", cosineSimilarity([1, 0], [1, 0]), 1);
check("orthogonal vectors -> 0", cosineSimilarity([1, 0], [0, 1]), 0);
check("opposite vectors -> -1", cosineSimilarity([1, 0], [-1, 0]), -1);
check("same direction scaled -> 1", cosineSimilarity([1, 2, 3], [2, 4, 6]), 1);
check("dimension mismatch -> 0", cosineSimilarity([1, 2], [1]), 0);
check("empty vectors -> 0", cosineSimilarity([], []), 0);
check("zero vector -> 0", cosineSimilarity([0, 0], [1, 1]), 0);
checkTrue(
  "ordinary example positive and symmetric",
  cosineSimilarity([1, 1], [1, 0]) === cosineSimilarity([1, 0], [1, 1]) &&
    cosineSimilarity([1, 1], [1, 0]) > 0.7,
);

console.log("splitIntoChunks + toChunkInputs");
const longContent = Array.from({ length: 40 }, (_, i) => "Paragraph number " + (i + 1) + " about plant cells").join("\n\n");
const chunks = splitIntoChunks("test-src", longContent);
checkTrue("long content split into multiple chunks", chunks.length > 1);
checkTrue(
  "every chunk respects the 900 char cap",
  chunks.every((chunk) => chunk.content.length <= 900),
);
check(
  "chunk indices sequential from 0",
  chunks.map((chunk) => chunk.chunkIndex),
  chunks.map((_, i) => i),
);
checkTrue(
  "checksums are non-empty and stable hex",
  chunks.every(
    (chunk) => chunk.checksum.length === 32 && /^[0-9a-f]+$/.test(chunk.checksum),
  ),
);
const chunksAgain = splitIntoChunks("test-src", longContent);
check(
  "chunking is deterministic across runs",
  chunksAgain.map((chunk) => chunk.checksum),
  chunks.map((chunk) => chunk.checksum),
);
check("short text stays a single chunk", splitIntoChunks("s", "One short paragraph.").length, 1);
check("empty text -> no chunks", splitIntoChunks("s", "   ").length, 0);

const inputs = toChunkInputs("test-src", "Photosynthesis", "Plants", longContent, { grade: 7 });
check(
  "toChunkInputs mirrors chunk output",
  inputs.map((input) => input.chunkIndex),
  chunks.map((chunk) => chunk.chunkIndex),
);
check("metadata forwarded onto every input", inputs[0]?.metadata, { grade: 7 });
check("source/title/topic forwarded", {
  source: inputs[0]?.source,
  title: inputs[0]?.title,
  topic: inputs[0]?.topic,
}, { source: "test-src", title: "Photosynthesis", topic: "Plants" });

console.log("slugifyTopic");
check("slugifies spaces and punctuation", slugifyTopic("Cell Division!"), "cell-division");
check("collapses internal whitespace", slugifyTopic("  Algebra   Basics  "), "algebra-basics");
check("drops leading/trailing separators", slugifyTopic(" --extremes-- "), "extremes");
check("empty stays empty", slugifyTopic("   "), "");

console.log("toKnowledgeSources");
const sources = toKnowledgeSources([
  {
    id: "c1",
    source: "novi-learn-base",
    title: "Chloroplasts",
    topic: "Chloroplasts",
    content: "A chloroplast is a double-membrane organelle.",
    metadata: null,
    embedding: [],
    checksum: "a",
    chunkIndex: 0,
    similarity: 0.876543,
  },
]);
check("confidence rounded to 2 decimals", sources[0]?.confidence, 0.88);
check("excerpt matches short content", sources[0]?.excerpt, "A chloroplast is a double-membrane organelle.");
check("fields forwarded", {
  title: sources[0]?.title,
  topic: sources[0]?.topic,
  source: sources[0]?.source,
}, { title: "Chloroplasts", topic: "Chloroplasts", source: "novi-learn-base" });
check("no sources in -> empty out", toKnowledgeSources([]).length, 0);
const longExcerptSource = toKnowledgeSources([
  {
    id: "c2",
    source: "s",
    title: "Long",
    topic: "t",
    content: "word ".repeat(200),
    metadata: null,
    embedding: [],
    checksum: "b",
    chunkIndex: 0,
    similarity: 0.5,
  },
]);
checkTrue(
  "over-long excerpts truncated below 244 chars",
  (longExcerptSource[0]?.excerpt.length ?? 0) <= 244 &&
    (longExcerptSource[0]?.excerpt ?? "").endsWith("…"),
);

console.log("buildSuggestions (personalization ranking + slug dedupe)");
const personalizationInput: PersonalizationInput = {
  recentLearning: [
    { topic: "Algebra", at: new Date("2026-01-03T00:00:00Z") },
    { topic: "algebra 1", at: new Date("2026-01-01T00:00:00Z") },
    { topic: "Photosynthesis", at: new Date("2026-01-02T00:00:00Z") },
  ],
  recentPractice: [
    { topic: "Cell biology", at: new Date("2026-01-04T00:00:00Z") },
    { topic: "cell biology", at: new Date("2026-01-02T00:00:00Z") },
  ],
  weakTopics: [
    { topic: "Fractions", bestAccuracy: 80, at: new Date("2026-01-05T00:00:00Z") },
    { topic: "Geometry", bestAccuracy: 40, at: new Date("2026-01-02T00:00:00Z") },
    { topic: "Statistics", bestAccuracy: 60, at: new Date("2026-01-06T00:00:00Z") },
  ],
  relatedNextTopics: [
    { topic: "Chloroplasts", at: new Date("2026-01-07T00:00:00Z") },
    { topic: "chloroplasts", at: new Date("2026-01-06T00:00:00Z") },
  ],
  masteredTopics: new Set(),
};
const suggestions = buildSuggestions(personalizationInput);
check(
  "kinds always appear in canonical order",
  suggestions.map((s) => s.kind),
  ["continue_learning", "practice_again", "review_weak_topic", "related_next_topic"],
);
check("continue uses most recent learning topic (Algebra)", suggestions[0]?.topic, "Algebra");
check("practice uses most recent practice topic", suggestions[1]?.topic, "Cell biology");
check(
  "weak uses lowest accuracy topic (Geometry)",
  suggestions[2]?.topic,
  "Geometry",
);
check("related uses most recent related topic (Chloroplasts)", suggestions[3]?.topic, "Chloroplasts");

const masteredInput: PersonalizationInput = {
  recentLearning: [
    { topic: "Algebra", at: new Date("2026-01-03") },
    { topic: "Photosynthesis", at: new Date("2026-01-01") },
  ],
  recentPractice: [],
  weakTopics: [],
  relatedNextTopics: [],
  masteredTopics: new Set(["Algebra"]),
};
const masteredSuggestions = buildSuggestions(masteredInput);
check(
  "continue skips mastered topics when an alternative exists",
  masteredSuggestions[0]?.topic,
  "Photosynthesis",
);

const allSameInput: PersonalizationInput = {
  recentLearning: [{ topic: "Calculus", at: new Date("2026-01-01") }],
  recentPractice: [{ topic: "calculus", at: new Date("2026-01-02") }],
  weakTopics: [{ topic: "Calculus", bestAccuracy: 30, at: new Date("2026-01-03") }],
  relatedNextTopics: [{ topic: "Calculus", at: new Date("2026-01-04") }],
  masteredTopics: new Set(),
};
const allSame = buildSuggestions(allSameInput);
checkTrue(
  "same topic across kinds never drops a suggestion kind",
  allSame.map((s) => s.kind).length === 4,
  allSame,
);
const emptyInput: PersonalizationInput = {
  recentLearning: [],
  recentPractice: [],
  weakTopics: [],
  relatedNextTopics: [],
  masteredTopics: new Set(),
};
check("empty progress -> no suggestions", buildSuggestions(emptyInput).length, 0);

console.log("buildTutorMessages (grounding injection)");
const groundedMessage = buildTutorMessages("  What is photosynthesis?  ", {
  sources: [
    {
      title: "Light reactions",
      topic: "Photosynthesis",
      source: "novi-learn-base",
      excerpt: "Light reactions occur in thylakoids.",
      confidence: 0.9,
    },
  ],
  systemContext: "The following knowledge was retrieved... [1] \"Light reactions\"",
});
checkTrue(
  "grounding context appended to the system prompt when present",
  groundedMessage.system.includes("===== GROUNDING CONTEXT"),
);
checkTrue(
  "retrieved source text is present in the system prompt",
  groundedMessage.system.includes("Light reactions"),
);
check(
  "user message keeps trimmed question",
  groundedMessage.user,
  "Student question: What is photosynthesis?\n\nReturn the JSON answer object.",
);
const plainMessage = buildTutorMessages("Question?", undefined);
checkTrue(
  "no grounding context when omitted",
  !plainMessage.system.includes("GROUNDING CONTEXT"),
);
const emptyContextMessage = buildTutorMessages("Question?", { sources: [], systemContext: "" });
checkTrue(
  "no grounding section for empty context",
  !emptyContextMessage.system.includes("GROUNDING CONTEXT"),
);

console.log(`\nUnit results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}