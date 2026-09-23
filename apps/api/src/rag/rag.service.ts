import { embedText } from "../ai/embeddings/service";
import { config } from "../config";
import { logger } from "../logger";
import { buildSystemContext, toKnowledgeSources } from "./context";
import { buildPersonalContext } from "./personal-context";
import type { GroundingContext } from "./types";
import { vectorStore } from "./vector-store";

function emptyGrounding(): GroundingContext {
  return { systemContext: "", sources: [] };
}

/**
 * Builds the retrieval-augmented grounding for a tutor request. Everything is
 * best-effort: any missing config, provider error, or DB error degrades to an
 * empty grounding so the un-ground AI path is never blocked.
 */
export async function buildGrounding(
  userId: string,
  question: string,
): Promise<GroundingContext> {
  if (!config.rag.enabled) {
    return emptyGrounding();
  }

  try {
    const questionEmbedding = await embedText(question);
    if (questionEmbedding === null || questionEmbedding.length === 0) {
      return emptyGrounding();
    }

    const chunks = await vectorStore.search(questionEmbedding, {
      topK: config.rag.topK,
      minScore: config.rag.minScore,
    });
    const sources = toKnowledgeSources(chunks);

    let personal;
    try {
      personal = await buildPersonalContext(userId);
    } catch (err: unknown) {
      logger.warn("[rag] personal context unavailable", logger.toError(err));
      personal = { knownTopics: [], practicedTopics: [], weakTopics: [] };
    }

    return {
      systemContext: buildSystemContext(sources, personal),
      sources,
    };
  } catch (err: unknown) {
    logger.warn("[rag] grounding degraded to ungrounded", logger.toError(err));
    return emptyGrounding();
  }
}