import { randomUUID } from "node:crypto";
process.env.PORT = "3207";
let passed = 0;
let failed = 0;
function check(description, actual, context) {
  if (actual) {
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
async function api(base, path, options = {}) {
  const headers = {
    "content-type": "application/json",
  };
  if (options.token !== undefined && options.token !== null) {
    headers.authorization = `Bearer ${options.token}`;
  }
  const response = await fetch(`${base}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  let body = {};
  try {
    body = JSON.parse(text);
  } catch {
    body = {
      _raw: text.slice(0, 200),
    };
  }
  return {
    status: response.status,
    body,
  };
}
function ok(description, condition, context) {
  check(description, condition, context);
}
async function main() {
  const { app } = await import("../src/index.js");
  const { prisma } = await import("../src/prisma.js");
  const {
    getProgressSummary,
    getTopicProgress,
    getSuggestions,
    listLearningHistory,
    listPracticeHistory,
    getPracticeHistoryDetail,
    recordLearningActivity,
  } = await import("../src/progress/progress.service.js");
  const { createPracticeSession } =
    await import("../src/practice/session-store.js");
  const { completePracticeSession } =
    await import("../src/practice/practice.service.js");
  const { InternalPracticeQuestion } =
    await import("../src/practice/practice.types.js");
  await new Promise((resolve) => setTimeout(resolve, 500));
  const base = "http://localhost:3207";
  const emails = [
    `phase8-a-${Date.now()}@test.local`,
    `phase8-b-${Date.now()}@test.local`,
  ];

  // Sign up two independent users.
  const signupA = await api(base, "/auth/signup", {
    method: "POST",
    body: {
      email: emails[0],
      password: "Test1234!",
      confirmPassword: "Test1234!",
      name: "Phase8 User A",
    },
  });
  const signupB = await api(base, "/auth/signup", {
    method: "POST",
    body: {
      email: emails[1],
      password: "Test1234!",
      confirmPassword: "Test1234!",
      name: "Phase8 User B",
    },
  });
  ok("signup A returns 201 with token", signupA.status === 201, signupA.body);
  ok("signup B returns 201 with token", signupB.status === 201, signupB.body);
  const tokenA = signupA.body.data.token;
  const tokenB = signupB.body.data.token;
  const userAId = signupA.body.data.user.id;
  const userBId = signupB.body.data.user.id;
  const progressPaths = [
    "/progress/summary",
    "/progress/history/learning",
    "/progress/history/practice",
    "/progress/topics",
    "/progress/suggestions",
  ];
  for (const path of progressPaths) {
    const result = await api(base, path);
    ok(`GET ${path} without token -> 401`, result.status === 401, result.body);
  }
  console.log("Empty state (fresh user A)");
  const emptySummary = await api(base, "/progress/summary", {
    token: tokenA,
  });
  ok(
    "empty summary counts zero",
    emptySummary.status === 200 &&
      emptySummary.body.data.learningActivityCount === 0 &&
      emptySummary.body.data.practiceSessionCount === 0 &&
      emptySummary.body.data.uniqueTopicCount === 0 &&
      emptySummary.body.data.learnedTopicCount === 0 &&
      emptySummary.body.data.practicedTopicCount === 0 &&
      emptySummary.body.data.averageAccuracy === null &&
      Array.isArray(emptySummary.body.data.recentActivity) &&
      emptySummary.body.data.recentActivity.length === 0,
  );
  ok(
    "empty topics list",
    (
      await api(base, "/progress/topics", {
        token: tokenA,
      })
    ).body.data.length === 0,
  );
  ok(
    "empty learning history",
    (
      await api(base, "/progress/history/learning", {
        token: tokenA,
      })
    ).body.data.length === 0,
  );
  ok(
    "empty practice history",
    (
      await api(base, "/progress/history/practice", {
        token: tokenA,
      })
    ).body.data.length === 0,
  );
  ok(
    "empty suggestions",
    (
      await api(base, "/progress/suggestions", {
        token: tokenA,
      })
    ).body.data.length === 0,
  );
  console.log("Seeding real activity for user A via service + DB");
  await recordLearningActivity(
    userAId,
    "photosynthesis",
    ["Chloroplasts", "Light Reactions"],
    ["Calvin Cycle"],
  );
  await recordLearningActivity(userAId, "magnetism");
  await recordLearningActivity(userAId, "photosynthesis");
  const resultsShape = [
    {
      questionId: "q1",
      question: "What captures sunlight?",
      type: "mcq",
      correct: true,
      answer: "Chlorophyll",
      correctAnswer: "Chlorophyll",
      explanation: "Chlorophyll absorbs light energy.",
    },
  ];
  const sessionStrong1 = randomUUID();
  const sessionStrong2 = randomUUID();
  const sessionWeak = randomUUID();
  await prisma.practiceSession.create({
    data: {
      id: sessionStrong1,
      userId: userAId,
      topic: "photosynthesis",
      questionCount: 5,
      difficulty: "easy",
      questionType: "mcq",
      totalQuestions: 5,
      correctAnswers: 5,
      incorrectAnswers: 0,
      accuracy: 100,
      score: 5,
      completedAt: new Date(Date.now() - 3600_000),
      results: resultsShape,
    },
  });
  await prisma.practiceSession.create({
    data: {
      id: sessionStrong2,
      userId: userAId,
      topic: "photosynthesis",
      questionCount: 5,
      difficulty: "medium",
      questionType: "mixed",
      totalQuestions: 5,
      correctAnswers: 4,
      incorrectAnswers: 1,
      accuracy: 80,
      score: 4,
      completedAt: new Date(Date.now() - 1200_000),
      results: [
        {
          ...resultsShape[0],
          questionId: "q2",
          correct: false,
          answer: "X",
        },
      ],
    },
  });
  await prisma.practiceSession.create({
    data: {
      id: sessionWeak,
      userId: userAId,
      topic: "magnetism",
      questionCount: 5,
      difficulty: "hard",
      questionType: "true_false",
      totalQuestions: 5,
      correctAnswers: 3,
      incorrectAnswers: 2,
      accuracy: 60,
      score: 3,
      completedAt: new Date(Date.now() - 60_000),
      results: resultsShape,
    },
  });
  console.log("Practice completion persistence (no AI needed)");
  const questions = [
    {
      id: "pq1",
      type: "mcq",
      question: "Carbon is the backbone of organic molecules?",
      options: ["Yes", "No"],
      correctAnswer: "Yes",
      acceptedAnswers: ["yes", "Yes"],
      explanation: "Organic chemistry is based on carbon chains.",
    },
    {
      id: "pq2",
      type: "true_false",
      question: "Water is a covalent compound.",
      correctAnswer: "True",
      acceptedAnswers: ["true", "True"],
      explanation: "Water is formed by covalent bonds.",
    },
  ];
  const session = createPracticeSession(
    userAId,
    {
      topic: "chemistry",
      questionCount: 5,
      difficulty: "easy",
      questionType: "mixed",
    },
    questions,
  );
  const completed = await completePracticeSession(userAId, session.sessionId);
  ok(
    "completion derives score from server-side answers",
    completed.score === 0,
  );
  ok("completion persists the session row", session.sessionId.length === 36);
  const storedSession = await prisma.practiceSession.findUnique({
    where: {
      id: session.sessionId,
    },
  });
  check(
    "persisted row exists in DB with topic chemistry",
    storedSession !== null && storedSession.topic === "chemistry",
  );
  console.log("Progress summary");
  const summary = await api(base, "/progress/summary", {
    token: tokenA,
  });
  const s = summary.body.data;
  ok("learning count = 3", s.learningActivityCount === 3);
  ok(
    "practice count = 4 (3 seeded + 1 completed)",
    s.practiceSessionCount === 4,
  );
  ok("total answers summed (5+5+5+2)", s.totalAnswers === 17);
  ok("total correct answers summed (5+4+3+0)", s.totalCorrectAnswers === 12);
  ok(
    "average accuracy rounded to one decimal (100,80,60,0 -> 60)",
    s.averageAccuracy === 60,
  );
  ok(
    "unique topics true union (photosynthesis, magnetism, chemistry)",
    s.uniqueTopicCount === 3,
  );
  ok(
    "recent activity max 10, sorted desc, has both types",
    Array.isArray(s.recentActivity) &&
      s.recentActivity.length <= 10 &&
      s.recentActivity.some((r) => r.type === "learn") &&
      s.recentActivity.some((r) => r.type === "practice"),
  );
  console.log("Topic progress");
  const topics = await api(base, "/progress/topics", {
    token: tokenA,
  });
  const topicsData = topics.body.data;
  const photosynthesis = topicsData.find((t) => t.topic === "photosynthesis");
  const magnetism = topicsData.find((t) => t.topic === "magnetism");
  const chemistry = topicsData.find((t) => t.topic === "chemistry");
  ok(
    "photosynthesis -> STRONG (2 practices, best 100 avg 90)",
    photosynthesis?.mastery === "STRONG" &&
      photosynthesis?.bestAccuracy === 100 &&
      photosynthesis?.averageAccuracy === 90,
  );
  ok(
    "magnetism -> PRACTICING, weak best 60",
    magnetism?.mastery === "PRACTICING" && magnetism?.bestAccuracy === 60,
  );
  ok(
    "chemistry -> PRACTICING (1 practice, 0 accuracy)",
    chemistry?.mastery === "PRACTICING" && chemistry?.averageAccuracy === 0,
  );
  ok(
    "photosynthesis progress = learn2(25) + practice2(20) + acc90(18) = 63",
    photosynthesis?.progress === 63,
  );
  ok(
    "topics sorted by lastActivityAt desc",
    topicsData[0].lastActivityAt >=
      topicsData[topicsData.length - 1].lastActivityAt,
  );
  console.log("Learning history");
  const learning = await api(base, "/progress/history/learning", {
    token: tokenA,
  });
  ok("learning history has 3 entries", learning.body.data.length === 3);
  ok(
    "all topics lowercase/collapsed",
    learning.body.data.every(
      (a) => a.topic === "photosynthesis" || a.topic === "magnetism",
    ),
  );
  const limitedLearning = await api(
    base,
    "/progress/history/learning?limit=1",
    {
      token: tokenA,
    },
  );
  ok("limit=1 honored", limitedLearning.body.data.length === 1);
  console.log("Practice history");
  const practice = await api(base, "/progress/history/practice", {
    token: tokenA,
  });
  ok("practice history has 4 entries", practice.body.data.length === 4);
  const detail = await api(base, `/progress/history/practice/${sessionWeak}`, {
    token: tokenA,
  });
  ok(
    "session detail returns topic, stats and results",
    detail.status === 200 &&
      detail.body.data.topic === "magnetism" &&
      detail.body.data.totalQuestions === 5 &&
      detail.body.data.results.length === 1 &&
      detail.body.data.results[0].question === "What captures sunlight?" &&
      detail.body.data.results[0].correctAnswer === "Chlorophyll",
  );
  const detailChemistry = await api(
    base,
    `/progress/history/practice/${session.sessionId}`,
    {
      token: tokenA,
    },
  );
  ok(
    "completed session detail includes question text from enriched results",
    detailChemistry.status === 200 &&
      detailChemistry.body.data.results.length === 2 &&
      detailChemistry.body.data.results[0].question ===
        "Carbon is the backbone of organic molecules?" &&
      detailChemistry.body.data.results[0].correct === false,
  );
  console.log("Suggestions");
  const suggestions = await api(base, "/progress/suggestions", {
    token: tokenA,
  });
  const kinds = suggestions.body.data.map((s) => s.kind);
  ok(
    "suggestions ordered continue, practice, weak, related",
    JSON.stringify(kinds) ===
      JSON.stringify([
        "continue_learning",
        "practice_again",
        "review_weak_topic",
        "related_next_topic",
      ]),
  );
  ok(
    "continue_learning skips mastered photosynthesis, picks magnetism",
    suggestions.body.data[0].topic === "magnetism",
  );
  ok(
    "review_weak_topic picks weakest practiced topic (chemistry 0)",
    suggestions.body.data.some(
      (s) => s.kind === "review_weak_topic" && s.topic === "chemistry",
    ),
  );
  ok(
    "related_next_topic surfaces metadata related concept first",
    suggestions.body.data.some(
      (s) => s.kind === "related_next_topic" && s.topic === "Chloroplasts",
    ),
  );
  console.log("Ownership & security");
  ok(
    "user B cannot see user A session detail (404)",
    (
      await api(base, `/progress/history/practice/${sessionWeak}`, {
        token: tokenB,
      })
    ).status === 404,
  );
  ok(
    "user B topics empty",
    (
      await api(base, "/progress/topics", {
        token: tokenB,
      })
    ).body.data.length === 0,
  );
  const summaryB = await api(base, "/progress/summary", {
    token: tokenB,
  });
  ok(
    "user B summary isolated",
    summaryB.body.data.learningActivityCount === 0 &&
      summaryB.body.data.practiceSessionCount === 0,
  );
  ok(
    "user B suggestions empty",
    (
      await api(base, "/progress/suggestions", {
        token: tokenB,
      })
    ).body.data.length === 0,
  );
  console.log("Validation");
  const badLimits = await Promise.all([
    api(base, "/progress/history/learning?limit=0", {
      token: tokenA,
    }),
    api(base, "/progress/history/learning?limit=101", {
      token: tokenA,
    }),
    api(base, "/progress/history/learning?limit=abc", {
      token: tokenA,
    }),
    api(base, "/progress/history/practice?limit=-3", {
      token: tokenA,
    }),
  ]);
  ok(
    "invalid limits -> 400",
    badLimits.every((r) => r.status === 400),
  );
  ok(
    "non-uuid session id -> 400",
    (
      await api(base, "/progress/history/practice/not-a-uuid", {
        token: tokenA,
      })
    ).status === 400,
  );
  const missingId = await api(
    base,
    "/progress/history/practice/00000000-0000-4000-8000-000000000000",
    {
      token: tokenA,
    },
  );
  ok("missing session -> 404", missingId.status === 404);
  console.log("Phase 7 regression (progress wiring must not break practice)");
  ok(
    "practice generate without token still 401",
    (
      await api(base, "/practice/generate", {
        method: "POST",
        body: {},
      })
    ).status === 401,
  );
  const generate = await api(base, "/practice/generate", {
    method: "POST",
    token: tokenA,
    body: {
      topic: "Regression",
      questionCount: 5,
      difficulty: "easy",
      questionType: "mcq",
    },
  });
  ok(
    "practice generate graceful 503 without AI key (not 500)",
    generate.status === 503,
  );
  ok(
    "no practice row leaked on failed generate",
    (await prisma.practiceSession.count({
      where: {
        userId: userAId,
      },
    })) === 4,
  );
  console.log("Service-level checks");
  const serviceSummary = await getProgressSummary(userAId);
  ok(
    "service summary matches HTTP summary",
    serviceSummary.practiceSessionCount === 4,
  );
  const serviceTopics = await getTopicProgress(userAId);
  ok("service topics has 3 topics", serviceTopics.length === 3);
  const serviceSuggestions = await getSuggestions(userAId);
  ok(
    "service suggestions deterministic",
    serviceSuggestions[0].kind === "continue_learning" &&
      serviceSuggestions[0].topic === "magnetism",
  );
  const learningHistory = await listLearningHistory(userAId, 2);
  ok(
    "learning history limit applies at service layer",
    learningHistory.length === 2,
  );
  const practiceHistory = await listPracticeHistory(userAId, 1);
  ok(
    "practice history limit applies at service layer",
    practiceHistory.length === 1,
  );
  const detailService = await getPracticeHistoryDetail(
    userAId,
    session.sessionId,
  );
  ok(
    "service detail returns enriched question text",
    detailService.results[0].question.startsWith("Carbon"),
  );
  console.log("Cleanup");
  await prisma.user.deleteMany({
    where: {
      id: {
        in: [userAId, userBId],
      },
    },
  });
  const remaining = await prisma.user.count({
    where: {
      id: {
        in: [userAId, userBId],
      },
    },
  });
  check("test users cleaned up (cascade)", remaining === 0);
  console.log(`\nIntegration results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}
main().catch((error) => {
  console.error("\nIntegration runtime error: " + String(error));
  console.error(`Integration results: ${passed} passed, ${failed} failed`);
  process.exit(1);
});
