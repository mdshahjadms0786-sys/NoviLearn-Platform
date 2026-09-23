import {
  computeMastery,
  computeTopicProgress,
} from "../src/progress/calculations.js";
import { buildSuggestions } from "../src/progress/personalization.js";
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
console.log("computeMastery");
check(
  "no activity -> NOT_STARTED",
  computeMastery({
    learningCount: 0,
    practiceCount: 0,
    bestAccuracy: null,
    averageAccuracy: null,
  }),
  "NOT_STARTED",
);
check(
  "learned but never practiced -> LEARNING",
  computeMastery({
    learningCount: 2,
    practiceCount: 0,
    bestAccuracy: null,
    averageAccuracy: null,
  }),
  "LEARNING",
);
check(
  "single practice, low accuracy -> PRACTICING",
  computeMastery({
    learningCount: 0,
    practiceCount: 1,
    bestAccuracy: 60,
    averageAccuracy: 60,
  }),
  "PRACTICING",
);
check(
  "two practices, best>=80 avg>=80 -> STRONG",
  computeMastery({
    learningCount: 0,
    practiceCount: 2,
    bestAccuracy: 90,
    averageAccuracy: 85,
  }),
  "STRONG",
);
check(
  "two practices, avg<80 -> PRACTICING",
  computeMastery({
    learningCount: 1,
    practiceCount: 2,
    bestAccuracy: 95,
    averageAccuracy: 70,
  }),
  "PRACTICING",
);
check(
  "two practices, avg null -> PRACTICING",
  computeMastery({
    learningCount: 0,
    practiceCount: 2,
    bestAccuracy: 90,
    averageAccuracy: null,
  }),
  "PRACTICING",
);
check(
  "one practice at 100% still PRACTICING",
  computeMastery({
    learningCount: 0,
    practiceCount: 1,
    bestAccuracy: 100,
    averageAccuracy: 100,
  }),
  "PRACTICING",
);
console.log("computeTopicProgress");
check(
  "no activity -> 0",
  computeTopicProgress({
    learningCount: 0,
    practiceCount: 0,
    bestAccuracy: null,
    averageAccuracy: null,
  }),
  0,
);
check(
  "full envelope -> 100",
  computeTopicProgress({
    learningCount: 5,
    practiceCount: 4,
    bestAccuracy: 100,
    averageAccuracy: 100,
  }),
  100,
);
check(
  "one learning only -> 13 (12.5 rounds)",
  computeTopicProgress({
    learningCount: 1,
    practiceCount: 0,
    bestAccuracy: null,
    averageAccuracy: 0,
  }),
  13,
);
check(
  "one practice at 80 avg -> 26",
  computeTopicProgress({
    learningCount: 0,
    practiceCount: 1,
    bestAccuracy: 80,
    averageAccuracy: 80,
  }),
  26,
);
check(
  "never negative when accuracy null",
  computeTopicProgress({
    learningCount: 0,
    practiceCount: 1,
    bestAccuracy: 50,
    averageAccuracy: null,
  }),
  10,
);
console.log("buildSuggestions");
check(
  "empty input -> []",
  buildSuggestions({
    recentLearning: [],
    recentPractice: [],
    weakTopics: [],
    relatedNextTopics: [],
    masteredTopics: new Set(),
  }),
  [],
);
check(
  "continue learning falls back to most recent when all mastered",
  buildSuggestions({
    recentLearning: [
      {
        topic: "math",
        at: new Date("2026-01-02T00:00:00Z"),
      },
    ],
    recentPractice: [],
    weakTopics: [],
    relatedNextTopics: [],
    masteredTopics: new Set(["math"]),
  }).map((s) => s.kind),
  ["continue_learning"],
);
check(
  "continue learning picks most recent non-mastered",
  buildSuggestions({
    recentLearning: [
      {
        topic: "algebra",
        at: new Date("2026-01-02T00:00:00Z"),
      },
      {
        topic: "geometry",
        at: new Date("2026-01-03T00:00:00Z"),
      },
    ],
    recentPractice: [],
    weakTopics: [],
    relatedNextTopics: [],
    masteredTopics: new Set(["geometry"]),
  }).map((s) => s.topic),
  ["algebra"],
);
check(
  "practice again present",
  buildSuggestions({
    recentLearning: [],
    recentPractice: [
      {
        topic: "chemistry",
        at: new Date("2026-01-02T00:00:00Z"),
      },
    ],
    weakTopics: [],
    relatedNextTopics: [],
    masteredTopics: new Set(),
  }).map((s) => s.kind),
  ["practice_again"],
);
check(
  "weak topic present with accuracy",
  buildSuggestions({
    recentLearning: [],
    recentPractice: [],
    weakTopics: [
      {
        topic: "physics",
        bestAccuracy: 55,
        at: new Date("2026-01-02T00:00:00Z"),
      },
    ],
    relatedNextTopics: [],
    masteredTopics: new Set(),
  }),
  [
    {
      kind: "review_weak_topic",
      title: "Review a weak topic",
      description: "physics needs a little more attention (best 55%).",
      topic: "physics",
    },
  ],
);
check(
  "related next topic present",
  buildSuggestions({
    recentLearning: [],
    recentPractice: [],
    weakTopics: [],
    relatedNextTopics: [
      {
        topic: "calvin cycle",
        at: new Date("2026-01-02T00:00:00Z"),
      },
    ],
    masteredTopics: new Set(),
  }).map((s) => s.kind),
  ["related_next_topic"],
);
check(
  "full ordering continue, practice, weak, related",
  buildSuggestions({
    recentLearning: [
      {
        topic: "english",
        at: new Date("2026-01-02T00:00:00Z"),
      },
    ],
    recentPractice: [
      {
        topic: "history",
        at: new Date("2026-01-02T00:00:00Z"),
      },
    ],
    weakTopics: [
      {
        topic: "music",
        bestAccuracy: 40,
        at: new Date("2026-01-02T00:00:00Z"),
      },
    ],
    relatedNextTopics: [
      {
        topic: "art",
        at: new Date("2026-01-02T00:00:00Z"),
      },
    ],
    masteredTopics: new Set(),
  }).map((s) => s.kind),
  [
    "continue_learning",
    "practice_again",
    "review_weak_topic",
    "related_next_topic",
  ],
);
console.log(`\nUnit results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
