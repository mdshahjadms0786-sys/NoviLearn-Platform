import { logger } from "../logger.js";
import { prisma } from "../prisma.js";
import { slugifyTopic } from "../utils/topic.js";
const TOPIC_MAX_LENGTH = 200;
export async function upsertTopic(name) {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (trimmed.length === 0) {
    return;
  }
  const slug = slugifyTopic(trimmed);
  if (slug.length === 0) {
    return;
  }
  try {
    await prisma.topic.upsert({
      where: {
        slug,
      },
      create: {
        slug,
        name: trimmed.slice(0, TOPIC_MAX_LENGTH),
      },
      update: {
        name: trimmed.slice(0, TOPIC_MAX_LENGTH),
      },
    });
  } catch (err) {
    logger.warn("[topics] upsert failed", {
      topic: trimmed,
      error: logger.toError(err),
    });
  }
}
