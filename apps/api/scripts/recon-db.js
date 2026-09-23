import { PrismaClient } from "@prisma/client";
async function main() {
  const prisma = new PrismaClient();
  try {
    const rows =
      await prisma.$queryRaw`SELECT name, default_version FROM pg_available_extensions WHERE name IN ('vector', 'cube', 'earthdistance') ORDER BY name`;
    for (const row of rows) {
      console.log(
        "EXT:",
        row.name,
        "->",
        row.default_version === null ? "NOT AVAILABLE" : row.default_version,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
