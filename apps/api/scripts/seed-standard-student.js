import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

async function seedStandardStudent() {
  console.log("Seeding standard student account...");

  const name = "Aarav Sharma";
  const email = "student@novilearn.com";
  const plainPassword = "NoviLearn@2026#Pro";
  const passwordHash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: "student",
      },
    });
    console.log(`✅ Created standard student: ${user.name} (${user.email})`);
  } else {
    user = await prisma.user.update({
      where: { email },
      data: {
        name,
        password: passwordHash,
      },
    });
    console.log(`✅ Updated standard student: ${user.name} (${user.email})`);
  }

  // Ensure default UserPreference exists
  await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: {
      language: "english",
      teachingStyle: "friendly",
      explanationLevel: "balanced",
      learningGoals: [
        "Master Core Concepts",
        "Prepare for Board/Entrance Exams",
        "Daily Practice",
      ],
    },
    create: {
      userId: user.id,
      language: "english",
      teachingStyle: "friendly",
      explanationLevel: "balanced",
      learningGoals: [
        "Master Core Concepts",
        "Prepare for Board/Entrance Exams",
        "Daily Practice",
      ],
    },
  });

  // Ensure active avatar is set
  const existingAvatar = await prisma.userAvatar.findFirst({
    where: { userId: user.id, isActive: true },
  });

  if (!existingAvatar) {
    await prisma.userAvatar.create({
      data: {
        userId: user.id,
        avatarType: "preset",
        avatarData: { id: "nova", name: "Nova", style: "friendly" },
        isActive: true,
      },
    });
  }

  console.log("\n========================================================");
  console.log("🎓 STANDARD REAL STUDENT CREDENTIALS READY");
  console.log("========================================================");
  console.log(`👤 Name:     ${name}`);
  console.log(`📧 Email:    ${email}`);
  console.log(`🔑 Password: ${plainPassword}`);
  console.log("========================================================\n");
}

seedStandardStudent()
  .catch((err) => {
    console.error("Failed to seed standard student:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
