/**
 * Phase 10 knowledge ingestion CLI.
 *
 * Usage:
 *   node scripts/ingest-knowledge.js --file ./knowledge.json
 *   node scripts/ingest-knowledge.js --sample
 *
 * JSON file shape:
 *   [{ "source": "novi-learn", "title": "…", "topic": "…",
 *      "content": "…", "metadata": { "grade": 7 } }]
 *
 * Chunks are deduped by checksum. Embeddings are backfilled when an embedding
 * provider is configured; otherwise chunks are stored pending.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { toChunkInputs } from "../src/rag/chunking.js";
import { ingestKnowledge } from "../src/rag/ingestion.js";
const SAMPLE_SOURCES = [
  {
    source: "novi-learn-base",
    title: "Photosynthesis: the light reactions",
    topic: "Photosynthesis",
    content:
      "Photosynthesis is the process plants use to convert light energy into chemical energy stored in glucose.\n\n" +
      "Light reactions occur in the thylakoid membranes of chloroplasts. Chlorophyll absorbs light, exciting electrons that travel down an electron transport chain. This powers the creation of ATP and NADPH.\n\n" +
      "Water molecules are split during these reactions, releasing oxygen as a byproduct.\n\n" +
      "The products, ATP and NADPH, then feed the Calvin cycle, which fixes carbon dioxide into glucose.",
    metadata: {
      grade: 7,
    },
  },
  {
    source: "novi-learn-base",
    title: "Photosynthesis: the Calvin cycle",
    topic: "Photosynthesis",
    content:
      "The Calvin cycle is the light-independent stage of photosynthesis. It occurs in the stroma of the chloroplast.\n\n" +
      "Carbon dioxide is fixed and combined with a five-carbon molecule (RuBP) by the enzyme RuBisCO, producing two molecules of 3-PGA.\n\n" +
      "Using ATP and NADPH from the light reactions, 3-PGA is converted into G3P, a three-carbon sugar. Most G3P is recycled to regenerate RuBP, while some leaves the cycle to build glucose and other carbohydrates.",
    metadata: {
      grade: 7,
    },
  },
  {
    source: "novi-learn-base",
    title: "Cell structure: the chloroplast",
    topic: "Chloroplasts",
    content:
      "A chloroplast is a double-membrane organelle found in plant cells and some algae where photosynthesis takes place.\n\n" +
      "Inside, stacked membrane sacs called thylakoids form grana. The fluid around them is the stroma.\n\n" +
      "The thylakoid membrane contains chlorophyll and the electron transport chain components used in the light reactions.",
    metadata: {
      grade: 7,
    },
  },
];
function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--file") {
      const value = args[i + 1];
      if (value !== undefined) {
        result.file = value;
      }
    } else if (arg === "--sample") {
      result.sample = true;
    }
  }
  return result;
}
function loadSources(args) {
  if (args.sample === true) {
    return SAMPLE_SOURCES;
  }
  if (args.file === undefined) {
    throw new Error(
      "Provide --file <path> or --sample. Example: node scripts/ingest-knowledge.js --sample",
    );
  }
  const path = resolve(process.cwd(), args.file);
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw);
}
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sources = loadSources(args);
  let totalAttempted = 0;
  let totalInserted = 0;
  let totalEmbedded = 0;
  for (const source of sources) {
    const inputs = toChunkInputs(
      source.source,
      source.title,
      source.topic,
      source.content,
      source.metadata,
    );
    const result = await ingestKnowledge(inputs);
    totalAttempted += result.attempted;
    totalInserted += result.inserted;
    totalEmbedded += result.embedded;
    process.stdout.write(
      `  ${source.title}: ${result.inserted}/${result.attempted} chunks added\n`,
    );
  }
  process.stdout.write(
    `\nIngestion complete: ${totalInserted}/${totalAttempted} chunks inserted, ${totalEmbedded} embedded.\n`,
  );
}
main().catch((error) => {
  process.stderr.write(`\nIngestion failed: ${String(error)}\n`);
  process.exitCode = 1;
});
