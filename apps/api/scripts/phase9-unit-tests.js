import { AppError } from "../src/errors.js";
import { normalizeTopic } from "../src/utils/topic.js";
import {
  RESPONSE_DISCLAIMER,
  normalizeProviderResponse,
} from "../src/ai/normalizer.js";
import { normalizePracticeQuestions } from "../src/practice/practice.normalizer.js";
import { toClientPracticeSet } from "../src/practice/practice.types.js";
import { evaluateAnswer } from "../src/practice/evaluator.js";
let passed = 0;
let failed = 0;
function check(description, actual, expected) {
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
function checkTrue(description, value, context) {
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
function expectThrows(description, fn, expectedStatus, expectedCode) {
  try {
    fn();
    failed += 1;
    console.error(`FAIL ${description} (did not throw)`);
  } catch (error) {
    if (error instanceof AppError) {
      checkTrue(
        description,
        error.statusCode === expectedStatus &&
          (expectedCode === undefined || error.code === expectedCode),
        {
          status: error.statusCode,
          code: error.code,
        },
      );
    } else {
      failed += 1;
      console.error(`FAIL ${description}`);
      console.error(`  threw non-AppError: ${String(error)}`);
    }
  }
}
const PRACTICE_CONFIG = {
  topic: "photosynthesis",
  questionCount: 3,
  difficulty: "medium",
  questionType: "mcq",
};
console.log("normalizeTopic (shared util used by progress + practice)");
check(
  "trims and collapses internal whitespace",
  normalizeTopic("  Photosynthesis   Module  "),
  "photosynthesis module",
);
check("lowercases", normalizeTopic("ALGEBRA"), "algebra");
check("normalizes tabs", normalizeTopic("calvin\tcycle"), "calvin cycle");
check(
  "keeps punctuation",
  normalizeTopic("Photosynthesis!"),
  "photosynthesis!",
);
check("caps length at 500", normalizeTopic("x".repeat(1000)).length, 500);
check("empty input stays empty", normalizeTopic("").length, 0);
console.log("normalizeProviderResponse (malformed AI responses)");
expectThrows(
  "not valid JSON -> 502 AI_RESPONSE_INVALID",
  () => normalizeProviderResponse("q", "not json"),
  502,
  "AI_RESPONSE_INVALID",
);
expectThrows(
  "valid JSON, wrong shape -> 502",
  () =>
    normalizeProviderResponse(
      "q",
      JSON.stringify({
        foo: 1,
      }),
    ),
  502,
  "AI_RESPONSE_INVALID",
);
expectThrows(
  "top-level array -> 502",
  () => normalizeProviderResponse("q", JSON.stringify([])),
  502,
  "AI_RESPONSE_INVALID",
);
expectThrows(
  "missing summary -> 502",
  () =>
    normalizeProviderResponse(
      "q",
      JSON.stringify({
        explanation: "only explanation",
      }),
    ),
  502,
  "AI_RESPONSE_INVALID",
);
expectThrows(
  "whitespace-only summary -> 502",
  () =>
    normalizeProviderResponse(
      "q",
      JSON.stringify({
        summary: "   ",
      }),
    ),
  502,
  "AI_RESPONSE_INVALID",
);
const fullResponse = normalizeProviderResponse(
  "  What is photosynthesis?  ",
  JSON.stringify({
    summary: "It is a process.",
    explanation: "Plants convert light to energy.",
    keyPoints: ["one", "two", "three", "four", "five", "six", "seven", "eight"],
    example: "Leaves are green.",
    analogy: "A factory.",
    followUps: ["Why are leaves green?"],
    relatedConcepts: ["Chlorophyll"],
    nextTopics: ["Calvin Cycle"],
    visualRepresentation: {
      type: "flow",
      title: "Light to sugar",
      nodes: [
        {
          label: "Sunlight",
        },
        {
          label: "Chlorophyll",
        },
      ],
      edges: [
        {
          from: 0,
          to: 1,
          label: "absorbs",
        },
      ],
    },
  }),
);
check("question trimmed", fullResponse.question, "What is photosynthesis?");
check(
  "sections ordered summary, explanation, key_points, example, analogy, follow_ups",
  fullResponse.sections.map((s) => s.type),
  ["summary", "explanation", "key_points", "example", "analogy", "follow_ups"],
);
check("disclaimer attached", fullResponse.disclaimer, RESPONSE_DISCLAIMER);
checkTrue(
  "related concepts surfaced",
  fullResponse.relatedConcepts?.length === 1,
);
checkTrue("next learning surfaced", fullResponse.nextLearning?.length === 1);
check("list capped at 6", fullResponse.sections.length, 6);
const keyPointsSection = fullResponse.sections.find(
  (s) => s.type === "key_points",
);
checkTrue(
  "extra key points dropped",
  keyPointsSection !== undefined &&
    "items" in keyPointsSection &&
    keyPointsSection.items.length === 6,
);
checkTrue(
  "visual title kept",
  fullResponse.visualLearning?.title === "Light to sugar",
);
check("visual edge label kept", fullResponse.visualLearning?.edges, [
  {
    from: 0,
    to: 1,
    label: "absorbs",
  },
]);
const minimalResponse = normalizeProviderResponse(
  "q",
  JSON.stringify({
    summary: "only",
  }),
);
check(
  "summary-only response keeps single section",
  minimalResponse.sections.map((s) => s.type),
  ["summary"],
);
checkTrue(
  "no empty relatedConcepts key",
  !("relatedConcepts" in minimalResponse),
);
checkTrue(
  "no empty visualLearning key",
  !("visualLearning" in minimalResponse),
);
const badVisualResponse = normalizeProviderResponse(
  "q",
  JSON.stringify({
    summary: "s",
    visualRepresentation: {
      type: "flow",
      nodes: [
        {
          label: "A",
        },
      ],
    },
  }),
);
checkTrue(
  "visual with fewer than 2 nodes omitted",
  !("visualLearning" in badVisualResponse),
);
const outOfRangeVisualResponse = normalizeProviderResponse(
  "q",
  JSON.stringify({
    summary: "s",
    visualRepresentation: {
      type: "steps",
      nodes: [
        {
          label: "A",
        },
        {
          label: "B",
        },
        {
          label: "C",
        },
      ],
      edges: [
        {
          from: 0,
          to: 9,
        },
        {
          from: 2,
          to: 2,
        },
      ],
    },
  }),
);
check(
  "invalid/self-loop edges replaced with linear chain",
  outOfRangeVisualResponse.visualLearning?.edges,
  [
    {
      from: 0,
      to: 1,
    },
    {
      from: 1,
      to: 2,
    },
  ],
);
console.log("normalizePracticeQuestions (malformed AI responses)");
expectThrows(
  "not valid JSON -> 502 AI_RESPONSE_INVALID",
  () => normalizePracticeQuestions(PRACTICE_CONFIG, "nope"),
  502,
  "AI_RESPONSE_INVALID",
);
expectThrows(
  "questions not an array -> 502",
  () =>
    normalizePracticeQuestions(
      PRACTICE_CONFIG,
      JSON.stringify({
        questions: "x",
      }),
    ),
  502,
  "AI_RESPONSE_INVALID",
);
expectThrows(
  "mcq missing correctAnswer -> 502",
  () =>
    normalizePracticeQuestions(
      PRACTICE_CONFIG,
      JSON.stringify({
        questions: [
          {
            type: "mcq",
            question: "Q?",
            options: ["A", "B"],
          },
        ],
      }),
    ),
  502,
);
expectThrows(
  "mcq correctAnswer not among options -> 502",
  () =>
    normalizePracticeQuestions(
      PRACTICE_CONFIG,
      JSON.stringify({
        questions: [
          {
            type: "mcq",
            question: "Q?",
            options: ["A", "B"],
            correctAnswer: "C",
            explanation: "e",
          },
        ],
      }),
    ),
  502,
);
expectThrows(
  "true_false with invalid correctAnswer -> 502",
  () =>
    normalizePracticeQuestions(
      PRACTICE_CONFIG,
      JSON.stringify({
        questions: [
          {
            type: "true_false",
            question: "Q?",
            correctAnswer: "Maybe",
            explanation: "e",
          },
        ],
      }),
    ),
  502,
);
expectThrows(
  "short_answer with empty accepted answers -> 502",
  () =>
    normalizePracticeQuestions(
      PRACTICE_CONFIG,
      JSON.stringify({
        questions: [
          {
            type: "short_answer",
            question: "Q?",
            correctAnswer: ["", "   "],
            explanation: "e",
          },
        ],
      }),
    ),
  502,
);
expectThrows(
  "empty question text -> 502",
  () =>
    normalizePracticeQuestions(
      PRACTICE_CONFIG,
      JSON.stringify({
        questions: [
          {
            type: "mcq",
            question: "   ",
            options: ["A", "B"],
            correctAnswer: "A",
            explanation: "e",
          },
        ],
      }),
    ),
  502,
);
expectThrows(
  "fewer distinct questions than requested -> 502",
  () =>
    normalizePracticeQuestions(
      PRACTICE_CONFIG,
      JSON.stringify({
        questions: [
          {
            type: "mcq",
            question: "Same?",
            options: ["A", "B"],
            correctAnswer: "A",
            explanation: "e1",
          },
          {
            type: "mcq",
            question: "Same?",
            options: ["A", "B"],
            correctAnswer: "A",
            explanation: "e2",
          },
        ],
      }),
    ),
  502,
);
const dedupeQuestions = normalizePracticeQuestions(
  PRACTICE_CONFIG,
  JSON.stringify({
    questions: [
      {
        type: "mcq",
        question: "What color?",
        options: ["Yes", "No", "Yes"],
        correctAnswer: "yes",
        explanation: "e1",
      },
      {
        type: "true_false",
        question: "Water is wet.",
        correctAnswer: "true",
        explanation: "e2",
      },
      {
        type: "short_answer",
        question: "Name the gas?",
        correctAnswer: ["oxygen", "O2"],
        explanation: "e3",
      },
    ],
  }),
);
check("valid set keeps requested count", dedupeQuestions.length, 3);
check(
  "ids sequential",
  dedupeQuestions.map((q) => q.id),
  ["q1", "q2", "q3"],
);
check(
  "mcq duplicate options removed, canonical case",
  dedupeQuestions[0]?.options,
  ["Yes", "No"],
);
check(
  "mcq correctAnswer matched to canonical option",
  dedupeQuestions[0]?.correctAnswer,
  "Yes",
);
check("true_false options enforced", dedupeQuestions[1]?.options, [
  "True",
  "False",
]);
check(
  "short_answer accepted answers preserved",
  dedupeQuestions[2]?.acceptedAnswers,
  ["oxygen", "O2"],
);
console.log("evaluateAnswer (server-side grading)");
const mcqQuestion = {
  id: "q1",
  type: "mcq",
  question: "Q?",
  options: ["Yes", "No"],
  correctAnswer: "Yes",
  acceptedAnswers: ["Yes"],
  explanation: "e",
};
const tfQuestion = {
  id: "q2",
  type: "true_false",
  question: "Q?",
  options: ["True", "False"],
  correctAnswer: "True",
  acceptedAnswers: ["True"],
  explanation: "e",
};
const saQuestion = {
  id: "q3",
  type: "short_answer",
  question: "Q?",
  acceptedAnswers: ["oxygen", "O2"],
  correctAnswer: "oxygen",
  explanation: "e",
};
checkTrue(
  "mcq case-insensitive match passes",
  evaluateAnswer(mcqQuestion, " yes "),
);
checkTrue("mcq wrong option fails", !evaluateAnswer(mcqQuestion, "No"));
checkTrue(
  "true_false canonical match passes",
  evaluateAnswer(tfQuestion, "true"),
);
checkTrue("true_false wrong value fails", !evaluateAnswer(tfQuestion, "False"));
checkTrue(
  "short_answer punctuation-tolerant match passes",
  evaluateAnswer(saQuestion, "Oxygen."),
);
checkTrue(
  "short_answer non-accepted fails",
  !evaluateAnswer(saQuestion, "Nitrogen"),
);
console.log("toClientPracticeSet (sensitive answer stripping)");
const internalSession = {
  sessionId: "00000000-0000-4000-8000-000000000001",
  userId: "u",
  topic: "chlorophyll",
  config: PRACTICE_CONFIG,
  questions: [
    {
      id: "q1",
      type: "mcq",
      question: "Which pigment?",
      options: ["Chlorophyll", "Melanin"],
      correctAnswer: "Chlorophyll",
      acceptedAnswers: ["Chlorophyll", "chlorophyll"],
      explanation: "Chlorophyll absorbs light.",
    },
  ],
  expiresAt: Date.now() + 60_000,
  answers: new Map(),
};
const clientSet = toClientPracticeSet(internalSession);
const serialized = JSON.stringify(clientSet);
checkTrue(
  "correctAnswer stripped from client payload",
  !serialized.includes("correctAnswer"),
);
checkTrue(
  "acceptedAnswers stripped from client payload",
  !serialized.includes("acceptedAnswers"),
);
checkTrue(
  "explanation stripped from client payload",
  !serialized.includes("explanation"),
);
checkTrue(
  "answer text not leaked",
  !serialized.includes("Chlorophyll absorbs light."),
);
check("visible question payload preserved", clientSet.questions, [
  {
    id: "q1",
    type: "mcq",
    question: "Which pigment?",
    options: ["Chlorophyll", "Melanin"],
  },
]);
checkTrue(
  "session id and topic preserved",
  clientSet.sessionId === internalSession.sessionId &&
    clientSet.topic === "chlorophyll",
);
check("config preserved", clientSet.config, PRACTICE_CONFIG);
console.log(`\nUnit results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
