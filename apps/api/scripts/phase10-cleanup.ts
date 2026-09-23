import { loadEnvFile } from "../src/env";

loadEnvFile();

async function main(): Promise<void> {
  const { prisma } = await import("../src/prisma");

  const users = await prisma.user.findMany({
    where: { email: { contains: "@test.local" } },
    select: { id: true, email: true },
  });
  const userIds = users.map((user) => user.id);

  const deletedUsers = userIds.length > 0
    ? await prisma.user.deleteMany({ where: { id: { in: userIds } } })
    : { count: 0 };

  const recent = userIds.length > 0
    ? await prisma.aiRecentEntry.deleteMany({ where: { userId: { in: userIds } } })
    : { count: 0 };

  // Auth limiters key on the client IP, so test-run windows accumulate across
  // suites. Reset all buckets so a fresh batch of suites sees clean windows.
  const buckets = await prisma.rateLimitBucket.deleteMany({});

  const chunks = await prisma.knowledgeChunk.deleteMany({
    where: { source: { startsWith: "phase10-" } },
  });

  console.log(
    `deleted users: ${deletedUsers.count}; recent entries: ${recent.count}; buckets reset: ${buckets.count}; phase10 chunks: ${chunks.count}`,
  );
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(String(error));
  process.exit(1);
});