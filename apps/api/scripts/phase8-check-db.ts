import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const users = await prisma.user.count({
    where: { email: { contains: "@test.local" } },
  });
  console.log("test users remaining:", users);
  const activities = await prisma.learningActivity.count();
  const sessions = await prisma.practiceSession.count();
  console.log("learning_activities rows:", activities);
  console.log("practice_sessions rows:", sessions);
  await prisma.$disconnect();
}

void main();
