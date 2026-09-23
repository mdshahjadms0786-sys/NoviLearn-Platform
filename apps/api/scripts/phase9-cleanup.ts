import { prisma } from "../src/prisma";

async function main(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { email: { contains: "@test.local" } },
    select: { id: true, email: true },
  });
  console.log(JSON.stringify(users));
  if (users.length > 0) {
    const ids = users.map((u) => u.id);
    const deleted = await prisma.user.deleteMany({ where: { id: { in: ids } } });
    const activities = await prisma.learningActivity.count({
      where: { userId: { in: ids } },
    });
    const practices = await prisma.practiceSession.count({
      where: { userId: { in: ids } },
    });
    console.log(
      `deleted users: ${deleted.count}; remaining activities: ${activities}; remaining practices: ${practices}`,
    );
  }
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(String(error));
  process.exit(1);
});