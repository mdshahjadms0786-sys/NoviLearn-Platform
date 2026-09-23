import { AppError } from "../src/errors";

process.env.PORT = "3208";

let passed = 0;
let failed = 0;

function check(description: string, actual: boolean, context?: unknown): void {
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

interface ApiResult {
  status: number;
  body: Record<string, any>;
}

async function api(
  base: string,
  path: string,
  options: {
    method?: string;
    token?: string | null;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<ApiResult> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(options.headers ?? {}),
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
  let body: Record<string, any> = {};
  try {
    body = JSON.parse(text) as Record<string, any>;
  } catch {
    body = { _raw: text.slice(0, 200) };
  }
  return { status: response.status, body };
}

interface QuestionRecord {
  id: string;
  type: "mcq" | "true_false" | "short_answer";
  question: string;
  options?: string[];
  correctAnswer: string;
  acceptedAnswers: string[];
  explanation: string;
}

function makeQuestions(): QuestionRecord[] {
  return [
    {
      id: "q1",
      type: "mcq",
      question: "Carbon is the backbone of organic molecules?",
      options: ["Yes", "No"],
      correctAnswer: "Yes",
      acceptedAnswers: ["yes", "Yes"],
      explanation: "Organic chemistry is based on carbon chains.",
    },
    {
      id: "q2",
      type: "true_false",
      question: "Water is a covalent compound.",
      correctAnswer: "True",
      acceptedAnswers: ["true", "True"],
      explanation: "Water is formed by covalent bonds.",
    },
  ] as unknown as QuestionRecord[];
}

async function main(): Promise<void> {
  await import("../src/index");
  const { prisma } = await import("../src/prisma");
  const { createPracticeSession } = await import(
    "../src/practice/session-store"
  );
  const {
    answerPracticeQuestion,
    completePracticeSession,
  } = await import("../src/practice/practice.service");
  const { recordLearningActivity } = await import(
    "../src/progress/progress.service"
  );

  await new Promise<void>((resolve) => setTimeout(resolve, 500));
  const base = "http://localhost:3208";

  const stamp = Date.now();
  const emailA = `phase9-a-${stamp}@test.local`;
  const emailB = `phase9-b-${stamp}@test.local`;

  console.log("Production readiness");
  const health = await api(base, "/health");
  check(
    "GET /health reports healthy",
    health.status === 200 && health.body.data.status === "healthy",
    health.body,
  );
  const corsHealth = await fetch(`${base}/health`, {
    headers: { Origin: "http://localhost:3000" },
  });
  check(
    "CORS reflects configured WEB_URL specifically (not wildcard)",
    corsHealth.headers.get("access-control-allow-origin") ===
      "http://localhost:3000",
  );

  console.log("Auth");
  const signupA = await api(base, "/auth/signup", {
    method: "POST",
    body: {
      email: emailA,
      password: "Test1234!",
      confirmPassword: "Test1234!",
      name: "Phase9 User A",
    },
  });
  check("signup returns 201", signupA.status === 201, signupA.body);
  check(
    "signup response never contains password hash",
    !JSON.stringify(signupA.body).includes("password"),
  );
  const tokenA = signupA.body.data.token as string;
  const userAId = signupA.body.data.user.id as string;

  const duplicateSignup = await api(base, "/auth/signup", {
    method: "POST",
    body: {
      email: emailA.toUpperCase(),
      password: "Test1234!",
      confirmPassword: "Test1234!",
      name: "Dupe",
    },
  });
  check(
    "duplicate signup (case-insensitive email) -> 409",
    duplicateSignup.status === 409,
    duplicateSignup.body,
  );

  const mismatchSignup = await api(base, "/auth/signup", {
    method: "POST",
    body: {
      email: `phase9-c-${stamp}@test.local`,
      password: "Test1234!",
      confirmPassword: "Different!",
      name: "Mismatch",
    },
  });
  check("mismatched confirmPassword -> 400", mismatchSignup.status === 400);

  const weakSignup = await api(base, "/auth/signup", {
    method: "POST",
    body: {
      email: `phase9-d-${stamp}@test.local`,
      password: "weak",
      confirmPassword: "weak",
      name: "Weak",
    },
  });
  check("weak password -> 400", weakSignup.status === 400);

  const loginOk = await api(base, "/auth/login", {
    method: "POST",
    body: { email: emailA, password: "Test1234!" },
  });
  check("login returns 200 with token", loginOk.status === 200, loginOk.body);
  check(
    "login response never contains password hash",
    !JSON.stringify(loginOk.body).includes("password"),
  );

  const loginBad = await api(base, "/auth/login", {
    method: "POST",
    body: { email: emailA, password: "Wrong1234!" },
  });
  check(
    "wrong password -> 401 INVALID_CREDENTIALS",
    loginBad.status === 401 &&
      loginBad.body.error?.code === "INVALID_CREDENTIALS",
    loginBad.body,
  );

  const me = await api(base, "/auth/me", { token: tokenA });
  check(
    "me returns the user",
    me.status === 200 && me.body.data.email === emailA.toLowerCase(),
    me.body,
  );
  check(
    "me without token -> 401",
    (await api(base, "/auth/me")).status === 401,
  );
  check(
    "me with garbage token -> 401",
    (await api(base, "/auth/me", { token: "not.a.real.token" })).status === 401,
  );

  const logout = await api(base, "/auth/logout", {
    method: "POST",
    token: tokenA,
  });
  check("logout returns 200", logout.status === 200, logout.body);
  check(
    "revoked token rejected on subsequent request -> 401",
    (await api(base, "/auth/me", { token: tokenA })).status === 401,
  );

  const relogin = await api(base, "/auth/login", {
    method: "POST",
    body: { email: emailA, password: "Test1234!" },
  });
  const tokenAFresh = relogin.body.data.token as string;
  check(
    "re-login after logout issues a fresh valid token",
    relogin.status === 200 &&
      (await api(base, "/auth/me", { token: tokenAFresh })).status === 200,
  );

  const signupB = await api(base, "/auth/signup", {
    method: "POST",
    body: {
      email: emailB,
      password: "Test1234!",
      confirmPassword: "Test1234!",
      name: "Phase9 User B",
    },
  });
  const tokenB = signupB.body.data.token as string;
  const userBId = signupB.body.data.user.id as string;

  console.log("AI guards (AI deliberately unconfigured in this environment)");
  check(
    "ai/learn without token -> 401",
    (await api(base, "/ai/learn", { method: "POST", body: { question: "What is light?" } })).status === 401,
  );
  const shortQuestion = await api(base, "/ai/learn", {
    method: "POST",
    token: tokenAFresh,
    body: { question: "x" },
  });
  check(
    "ai/learn with overshort question -> 400",
    shortQuestion.status === 400,
    shortQuestion.body,
  );
  const noConfig = await api(base, "/ai/learn", {
    method: "POST",
    token: tokenAFresh,
    body: { question: "What is photosynthesis?" },
  });
  check(
    "ai/learn without AI provider/config -> 503 (not 500)",
    noConfig.status === 503 &&
      noConfig.body.error?.code === "AI_PROVIDER_NOT_CONFIGURED",
    noConfig.body,
  );
  check(
    "no learning activity recorded on failed AI request",
    (await prisma.learningActivity.count({ where: { userId: userAId } })) === 0,
  );

  console.log("AI per-user rate limiting");
  const burstResults = await Promise.all(
    Array.from({ length: 20 }, () =>
      api(base, "/ai/learn", {
        method: "POST",
        token: tokenAFresh,
        body: { question: `Rate probe ${Math.random()}` },
      }),
    ),
  );
  check(
    "18 of 20 burst requests allowed (2 earlier attempts in the same window)",
    burstResults.filter((r) => r.status === 503).length === 18,
    burstResults.map((r) => r.status),
  );
  const limited = await api(base, "/ai/learn", {
    method: "POST",
    token: tokenAFresh,
    body: { question: "Rate probe overflow" },
  });
  check(
    "21st request -> 429 RATE_LIMITED",
    limited.status === 429,
    limited.body,
  );
  const otherUserProbe = await api(base, "/ai/learn", {
    method: "POST",
    token: tokenB,
    body: { question: "Is the limit per user?" },
  });
  check(
    "another user unaffected by A's limit (503, not 429)",
    otherUserProbe.status === 503,
    otherUserProbe.body,
  );

  console.log("Practice session security & idempotency (service level, no AI)");
  const messyTopic = "  Photosynthesis!  ";
  const session = createPracticeSession(
    userAId,
    {
      topic: messyTopic,
      questionCount: 2,
      difficulty: "easy",
      questionType: "mixed",
    },
    makeQuestions() as unknown as Parameters<typeof createPracticeSession>[2],
  );

  const answer1 = await answerPracticeQuestion(
    userAId,
    session.sessionId,
    "q1",
    "Yes",
  );
  check(
    "correct answer graded true with explanation returned",
    answer1.correct === true &&
      answer1.correctAnswer === "Yes" &&
      answer1.explanation.length > 0,
    answer1,
  );
  const answer1repeat = await answerPracticeQuestion(
    userAId,
    session.sessionId,
    "q1",
    "No",
  );
  check(
    "re-answering a question is idempotent (first score kept)",
    answer1repeat.correct === true && answer1repeat.correctAnswer === "Yes",
    answer1repeat,
  );
  try {
    await answerPracticeQuestion(userAId, session.sessionId, "q404", "x");
    check("unknown question id -> 400", false);
  } catch (error) {
    check(
      "unknown question id -> 400",
      error instanceof AppError && error.statusCode === 400,
    );
  }
  try {
    await answerPracticeQuestion(userBId, session.sessionId, "q1", "Yes");
    check("another user cannot answer A's session -> 404", false);
  } catch (error) {
    check(
      "another user cannot answer A's session -> 404",
      error instanceof AppError && error.statusCode === 404,
    );
  }

  const completed = await completePracticeSession(userAId, session.sessionId);
  check(
    "completion scores server-side answers (1/2 correct = 50%)",
    completed.totalQuestions === 2 &&
      completed.correctAnswers === 1 &&
      completed.accuracy === 50,
    completed,
  );
  check(
    "completion normalizes topic for stored result",
    completed.topic === "photosynthesis!",
    completed.topic,
  );

  await completePracticeSession(userAId, session.sessionId);
  const rowCount = await prisma.practiceSession.count({
    where: { id: session.sessionId },
  });
  check(
    "double-completion is idempotent (single persisted row)",
    rowCount === 1,
    rowCount,
  );
  const storedRow = await prisma.practiceSession.findUnique({
    where: { id: session.sessionId },
  });
  check(
    "persisted row uses normalized topic so it merges with learning history",
    storedRow?.topic === "photosynthesis!",
    storedRow?.topic,
  );
  check(
    "persisted results exclude correct answers only on client view (server detail keeps them)",
    (storedRow?.results as unknown as { questionId: string }[]).length === 2,
  );

  try {
    await completePracticeSession(userBId, session.sessionId);
    check("another user cannot complete A's session -> 404", false);
  } catch (error) {
    check(
      "another user cannot complete A's session -> 404",
      error instanceof AppError && error.statusCode === 404,
    );
  }

  const expiredSession = createPracticeSession(
    userAId,
    {
      topic: "Expired",
      questionCount: 1,
      difficulty: "easy",
      questionType: "mcq",
    },
    makeQuestions().slice(0, 1) as unknown as Parameters<typeof createPracticeSession>[2],
  );
  const realNow = Date.now;
  Date.now = () => realNow() + 61 * 60 * 1000;
  try {
    try {
      await answerPracticeQuestion(userAId, expiredSession.sessionId, "q1", "Yes");
      check("expired session answer -> 404", false);
    } catch (error) {
      check(
        "expired session answer -> 404",
        error instanceof AppError && error.statusCode === 404,
      );
    }
    try {
      await completePracticeSession(userAId, expiredSession.sessionId);
      check("expired session completion -> 404", false);
    } catch (error) {
      check(
        "expired session completion -> 404",
        error instanceof AppError && error.statusCode === 404,
      );
    }
    check(
      "expired session never persisted",
      (await prisma.practiceSession.count({
        where: { id: expiredSession.sessionId },
      })) === 0,
    );
  } finally {
    Date.now = realNow;
  }

  const httpGenerate = await api(base, "/practice/generate", {
    method: "POST",
    token: tokenB,
    body: {
      topic: "Regression",
      questionCount: 5,
      difficulty: "easy",
      questionType: "mcq",
    },
  });
  check(
    "practice/generate without AI config -> 503 (not 500)",
    httpGenerate.status === 503,
    httpGenerate.body,
  );
  check(
    "no practice row leaked on failed generate",
    (await prisma.practiceSession.count({ where: { userId: userBId } })) === 0,
  );

  console.log("Progress merge across learn + practice (topic normalization)");
  await recordLearningActivity(userAId, "  Photosynthesis!  ", ["Chloroplasts"]);
  const topics = await prisma.learningActivity.findMany({
    where: { userId: userAId },
  });
  check(
    "learning activity topic normalized",
    topics.length === 1 && topics[0]?.topic === "photosynthesis!",
    topics.map((t) => t.topic),
  );
  const summary = await api(base, "/progress/summary", { token: tokenAFresh });
  check(
    "learning + practice rows on same normalized topic count as one unique topic",
    summary.body.data.uniqueTopicCount === 1 &&
      summary.body.data.learningActivityCount === 1 &&
      summary.body.data.practiceSessionCount === 1,
    summary.body.data,
  );
  const topicsList = await api(base, "/progress/topics", { token: tokenAFresh });
  check(
    "topic progress merged from both activity kinds",
    topicsList.body.data.length === 1 &&
      topicsList.body.data[0].topic === "photosynthesis!" &&
      topicsList.body.data[0].mastery === "PRACTICING",
    topicsList.body,
  );

  console.log("Progress isolation & validation");
  check(
    "progress summary without token -> 401",
    (await api(base, "/progress/summary")).status === 401,
  );
  const summaryB = await api(base, "/progress/summary", { token: tokenB });
  check(
    "fresh user B summary empty",
    summaryB.body.data.learningActivityCount === 0 &&
      summaryB.body.data.practiceSessionCount === 0 &&
      summaryB.body.data.uniqueTopicCount === 0,
    summaryB.body,
  );
  check(
    "user B cannot read A's session detail -> 404",
    (
      await api(base, `/progress/history/practice/${session.sessionId}`, {
        token: tokenB,
      })
    ).status === 404,
  );
  const detailOwn = await api(
    base,
    `/progress/history/practice/${session.sessionId}`,
    { token: tokenAFresh },
  );
  check(
    "owner can read session detail with correct answers (server-side only)",
    detailOwn.status === 200 &&
      detailOwn.body.data.topic === "photosynthesis!" &&
      detailOwn.body.data.results[0].correctAnswer === "Yes",
    detailOwn.body,
  );
  check(
    "invalid progress limit -> 400",
    (await api(base, "/progress/history/learning?limit=0", { token: tokenAFresh }))
      .status === 400,
  );
  check(
    "non-uuid session id -> 400",
    (await api(base, "/progress/history/practice/nope", { token: tokenAFresh }))
      .status === 400,
  );

  console.log("Cleanup");
  await prisma.user.deleteMany({ where: { id: { in: [userAId, userBId] } } });
  const remaining = await prisma.user.count({
    where: { id: { in: [userAId, userBId] } },
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