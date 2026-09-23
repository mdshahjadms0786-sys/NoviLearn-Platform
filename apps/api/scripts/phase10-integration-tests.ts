import { spawnSync } from "node:child_process";
import { EventEmitter } from "node:events";

process.env.PORT = "3210";
process.env.EMBEDDING_PROVIDER = "local";

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
      question: "Does phase ten persist sessions?",
      options: ["Yes", "No"],
      correctAnswer: "Yes",
      acceptedAnswers: ["yes", "Yes"],
      explanation: "Sessions are written through to Postgres.",
    },
    {
      id: "q2",
      type: "true_false",
      question: "Postgres is the durable session store.",
      correctAnswer: "True",
      acceptedAnswers: ["true", "True"],
      explanation: "Active practice sessions live in the database.",
    },
  ] as unknown as QuestionRecord[];
}

class FakeResponse extends EventEmitter {
  statusCode = 200;
  status(code: number): this {
    this.statusCode = code;
    return this;
  }
  json(): this {
    return this;
  }
}

function questionTokenQuery(): string {
  return "Where does a xylophone zygote go near a quasar";
}

async function main(): Promise<void> {
  await import("../src/index");
  const { prisma } = await import("../src/prisma");
  const { createRecentDuplicateGuard } = await import("../src/utils/dedupe");
  const { buildGrounding } = await import("../src/rag/rag.service");
  const { buildPersonalContext } = await import("../src/rag/personal-context");
  const { toChunkInputs } = await import("../src/rag/chunking");
  const { ingestKnowledge } = await import("../src/rag/ingestion");
  const { createPracticeSession } = await import(
    "../src/practice/session-store"
  );
  const { answerPracticeQuestion } = await import(
    "../src/practice/practice.service"
  );
  const { recordLearningActivity } = await import(
    "../src/progress/progress.service"
  );

  await new Promise<void>((resolveReady) => setTimeout(resolveReady, 500));
  const base = "http://localhost:3210";

  const stamp = Date.now();
  const emailA = `phase10-a-${stamp}@test.local`;
  const emailB = `phase10-b-${stamp}@test.local`;
  const testSource = `phase10-${stamp}`;

  await prisma.knowledgeChunk.deleteMany({
    where: { source: { startsWith: "phase10-" } },
  });

  console.log("Health/readiness");
  const health = await api(base, "/health");
  check(
    "GET /health reports healthy",
    health.status === 200 && health.body.data.status === "healthy",
    health.body,
  );
  const readiness = await api(base, "/health/readiness");
  check(
    "GET /health/readiness reports healthy with passing database check",
    readiness.status === 200 &&
      readiness.body.data.status === "healthy" &&
      readiness.body.data.checks.database.status === "healthy",
    readiness.body,
  );

  console.log("Auth");
  const signupA = await api(base, "/auth/signup", {
    method: "POST",
    body: {
      email: emailA,
      password: "Test1234!",
      confirmPassword: "Test1234!",
      name: "Phase10 User A",
    },
  });
  check("signup returns 201", signupA.status === 201, signupA.body);
  const tokenA = signupA.body.data.token as string;
  const userAId = signupA.body.data.user.id as string;

  const signupB = await api(base, "/auth/signup", {
    method: "POST",
    body: {
      email: emailB,
      password: "Test1234!",
      confirmPassword: "Test1234!",
      name: "Phase10 User B",
    },
  });
  check("second user signup returns 201", signupB.status === 201, signupB.body);
  const tokenB = signupB.body.data.token as string;
  const userBId = signupB.body.data.user.id as string;

  console.log("DB-backed rate limiting (shared across instances)");
  const burstResults = await Promise.all(
    Array.from({ length: 20 }, () =>
      api(base, "/ai/learn", {
        method: "POST",
        token: tokenA,
        body: { question: `Rate probe ${Math.random()}` },
      }),
    ),
  );
  check(
    "20 burst requests allowed for a fresh user (count 1..20 <= max)",
    burstResults.filter((r) => r.status === 503).length === 20,
    burstResults.map((r) => r.status),
  );
  const limited = await api(base, "/ai/learn", {
    method: "POST",
    token: tokenA,
    body: { question: "Rate probe overflow" },
  });
  check(
    "21st request -> 429 RATE_LIMITED",
    limited.status === 429 && limited.body.error?.code === "RATE_LIMITED",
    limited.body,
  );
  const bucket = await prisma.rateLimitBucket.findUnique({
    where: { key: userAId },
  });
  check(
    "limiter state persisted to rate_limit_buckets with count 21",
    bucket !== null && bucket.count === 21,
    bucket,
  );
  const otherUserProbe = await api(base, "/ai/learn", {
    method: "POST",
    token: tokenB,
    body: { question: "Is the limit per user?" },
  });
  check(
    "another user unaffected (503, not 429)",
    otherUserProbe.status === 503,
    otherUserProbe.body,
  );
  const realNow = Date.now;
  try {
    Date.now = () => realNow() + 11 * 60 * 1000;
    const afterWindow = await api(base, "/ai/learn", {
      method: "POST",
      token: tokenA,
      body: { question: "Window should have reset" },
    });
    check(
      "window expiry resets the bucket (request allowed again)",
      afterWindow.status === 503,
      afterWindow.body,
    );
    const resetBucket = await prisma.rateLimitBucket.findUnique({
      where: { key: userAId },
    });
    check(
      "bucket count reset to 1 after window expiry",
      resetBucket !== null && resetBucket.count === 1,
      resetBucket,
    );
  } finally {
    Date.now = realNow;
  }

  console.log("DB-backed recent-question dedupe");
  const guard = createRecentDuplicateGuard({ windowMs: 10_000 });
  let nextCalls = 0;
  const fakeReqA = {
    user: { id: userAId },
    body: { question: "Repeat me exactly" },
    ip: "1.2.3.4",
  };
  const res1 = new FakeResponse();
  await guard(fakeReqA as never, res1 as never, () => {
    nextCalls += 1;
  });
  check("first occurrence allowed", nextCalls === 1);
  res1.emit("finish");
  await new Promise((resolveWait) => setTimeout(resolveWait, 400));
  const recent = await prisma.aiRecentEntry.findUnique({
    where: { userId: userAId },
  });
  check(
    "recent question entry persisted to ai_recent_entries",
    recent !== null,
    recent,
  );
  const res2 = new FakeResponse();
  await guard(fakeReqA as never, res2 as never, () => {
    nextCalls += 1;
  });
  check(
    "immediate repeat blocked -> 429",
    nextCalls === 1 && res2.statusCode === 429,
    { nextCalls, statusCode: res2.statusCode },
  );
  const res3 = new FakeResponse();
  await guard(
    { user: { id: userAId }, body: { question: "A different question" } } as never,
    res3 as never,
    () => {
      nextCalls += 1;
    },
  );
  check("different question allowed", nextCalls === 2);
  const res4 = new FakeResponse();
  try {
    Date.now = () => realNow() + 11_000;
    await guard(fakeReqA as never, res4 as never, () => {
      nextCalls += 1;
    });
    check("repeat after dedupe window allowed", nextCalls === 3);
  } finally {
    Date.now = realNow;
  }

  console.log("RAG grounding (ingest -> embed -> retrieve)");
  const before = await buildGrounding(userAId, questionTokenQuery());
  check(
    "retrieval empty before ingestion (no false positives)",
    before.sources.length === 0,
    before.sources,
  );
  const content =
    "A xylophone zygote orbits a quasar. Xylophone zygotes align with quasar gravity near the test corpus.";
  const inputs = toChunkInputs(
    testSource,
    "Phase10 Test Source",
    "Test Topic",
    content,
    { phase: 10 },
  );
  const ingested = await ingestKnowledge(inputs);
  check(
    "ingestion inserts the new chunk",
    ingested.inserted === inputs.length,
    ingested,
  );
  const insertedChunk = await prisma.knowledgeChunk.findFirst({
    where: { source: testSource },
  });
  check(
    "ingested chunk embedded via local provider (two-phase backfill)",
    insertedChunk !== null && insertedChunk.embedding.length > 0,
    insertedChunk?.embedding.length,
  );
  const grounded = await buildGrounding(userAId, questionTokenQuery());
  check(
    "retrieval returns the test source after ingestion",
    grounded.sources.length >= 1 &&
      grounded.sources.some(
        (source) => source.source === testSource && source.title === "Phase10 Test Source",
      ),
    grounded.sources,
  );
  checkTrueForGrounding(
    "every retrieved source exposes a bounded confidence + excerpt",
    grounded.sources.every(
      (source) =>
        source.confidence >= 0 &&
        source.confidence <= 1 &&
        source.excerpt.length > 0,
    ),
  );
  check(
    "system context carries the retrieved content for the prompt",
    grounded.systemContext.includes("Phase10 Test Source") &&
      grounded.systemContext.includes("xylophone"),
    grounded.systemContext.slice(0, 200),
  );
  await prisma.knowledgeChunk.deleteMany({ where: { source: testSource } });

  console.log("Session write-through persistence (fresh process restart)");
  const session = createPracticeSession(
    userAId,
    {
      topic: "photosynthesis-restart",
      questionCount: 2,
      difficulty: "easy",
      questionType: "mixed",
    },
    makeQuestions() as unknown as Parameters<typeof createPracticeSession>[2],
  );
  const answer = await answerPracticeQuestion(
    userAId,
    session.sessionId,
    "q1",
    "Yes",
  );
  check("answer graded server-side", answer.correct === true, answer);
  const persistedRow = await prisma.activePracticeSession.findUnique({
    where: { id: session.sessionId },
  });
  check(
    "session persisted to active_practice_sessions after answering",
    persistedRow !== null,
  );
  const spawned = spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/phase10-restart-check.ts"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PHASE10_SESSION_ID: session.sessionId,
        PHASE10_USER_ID: userAId,
      },
      encoding: "utf8",
      timeout: 60_000,
    },
  );
  check(
    "fresh process reads the session from Postgres (no in-memory cache)",
    spawned.status === 0 &&
      (spawned.stdout ?? "").includes("PHASE10_RESTART_OK"),
    {
      status: spawned.status,
      stdout: spawned.stdout,
      stderr: spawned.stderr,
    },
  );

  console.log("Personal context + topic catalog (owner scoped, recency ranked)");
  await recordLearningActivity(userAId, "Zygotes", ["Chloroplasts"]);
  const topicRow = await prisma.topic.findUnique({ where: { slug: "zygotes" } });
  check(
    "recordLearningActivity upserts the Topic catalog row",
    topicRow !== null && topicRow.name === "zygotes",
    topicRow,
  );
  await prisma.practiceSession.create({
    data: {
      userId: userAId,
      topic: "zygotes",
      questionCount: 2,
      difficulty: "easy",
      questionType: "mcq",
      totalQuestions: 2,
      correctAnswers: 0,
      incorrectAnswers: 2,
      accuracy: 40,
      score: 0,
      results: {},
      completedAt: new Date(),
    },
  });
  const personal = await buildPersonalContext(userAId);
  check(
    "weak topic detected from low-accuracy practice history",
    personal.weakTopics.includes("zygotes"),
    personal,
  );
  check(
    "personal context is owner scoped (user B sees no topics)",
    (await buildPersonalContext(userBId)).knownTopics.length === 0 &&
      (await buildPersonalContext(userBId)).weakTopics.length === 0,
  );
  const suggestions = await api(base, "/progress/suggestions", {
    token: tokenA,
  });
  check(
    "suggestions lead with continue_learning for the most recent topic",
    suggestions.body.data.length >= 1 &&
      suggestions.body.data[0].kind === "continue_learning" &&
      suggestions.body.data[0].topic === "zygotes",
    suggestions.body.data,
  );
  const suggestionsB = await api(base, "/progress/suggestions", {
    token: tokenB,
  });
  check(
    "fresh user receives no suggestions",
    suggestionsB.body.data.length === 0,
    suggestionsB.body,
  );

  console.log("Cleanup");
  await prisma.user.deleteMany({
    where: { id: { in: [userAId, userBId] } },
  });
  await prisma.aiRecentEntry.deleteMany({
    where: { userId: { in: [userAId, userBId] } },
  });
  await prisma.rateLimitBucket.deleteMany({
    where: { key: { in: [userAId, userBId] } },
  });
  await prisma.topic.deleteMany({ where: { slug: "zygotes" } });
  const chunksLeft = await prisma.knowledgeChunk.count({
    where: { source: { startsWith: "phase10-" } },
  });
  const usersLeft = await prisma.user.count({
    where: { id: { in: [userAId, userBId] } },
  });
  check("test users removed (cascade)", usersLeft === 0);
  check("test knowledge chunks removed", chunksLeft === 0);

  console.log(`\nIntegration results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

function checkTrueForGrounding(description: string, value: boolean): void {
  if (value) {
    passed += 1;
    console.log(`  ok ${description}`);
  } else {
    failed += 1;
    console.error(`FAIL ${description}`);
  }
}

main().catch((error) => {
  console.error("\nIntegration runtime error: " + String(error));
  console.error(`Integration results: ${passed} passed, ${failed} failed`);
  process.exit(1);
});