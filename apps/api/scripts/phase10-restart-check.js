import { getValidPracticeSession } from "../src/practice/session-store.js";
import { prisma } from "../src/prisma.js";
const sessionId = process.env.PHASE10_SESSION_ID;
const userId = process.env.PHASE10_USER_ID;
async function main() {
  if (
    sessionId === undefined ||
    sessionId === "" ||
    userId === undefined ||
    userId === ""
  ) {
    console.error("PHASE10_RESTART_FAIL reason=missing-env");
    process.exit(1);
  }
  const session = await getValidPracticeSession(sessionId, userId);
  const persisted = await prisma.activePracticeSession.findUnique({
    where: {
      id: sessionId,
    },
  });
  const answerCount = session.answers.size;
  const topic = session.topic;
  if (
    persisted === null ||
    topic !== "photosynthesis-restart" ||
    answerCount !== 1
  ) {
    console.error(
      `PHASE10_RESTART_FAIL topic=${topic} answers=${answerCount} persisted=${persisted !== null}`,
    );
    process.exit(1);
  }
  console.log(`PHASE10_RESTART_OK topic=${topic} answers=${answerCount}`);
}
main()
  .catch((error) => {
    console.error(`PHASE10_RESTART_FAIL error=${String(error)}`);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
