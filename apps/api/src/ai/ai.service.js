import { config } from "../config.js";
import { normalizeProviderResponse } from "./normalizer.js";
import { buildGrounding } from "../rag/rag.service.js";
import { buildTutorMessages } from "./prompts/system.js";
import { createProvider } from "./providers/index.js";
import { generateEducationalResponse } from "./educational-engine.js";
import { logger } from "../logger.js";

const DEFAULT_MAX_TOKENS = 700;
const DEFAULT_TEMPERATURE = 0.4;
const DEFAULT_TIMEOUT_MS = 30_000;

export async function completeProviderRequest(options) {
  const { ai } = config;
  const isPlaceholderKey =
    !ai ||
    !ai.apiKey ||
    ai.apiKey.includes("your-openai-api-key") ||
    ai.apiKey.includes("your-anthropic-api-key") ||
    ai.apiKey.trim().length === 0;

  const msgStr =
    typeof options.messages === "string"
      ? options.messages
      : JSON.stringify(options.messages || {});

  const isPracticeRequest =
    options.maxTokens === 2500 ||
    msgStr.toLowerCase().includes("question count") ||
    msgStr.toLowerCase().includes("practice set") ||
    msgStr.toLowerCase().includes("question types");

  // If a real external AI provider is configured (e.g. Gemini, OpenAI, Anthropic), attempt real call
  if (!isPlaceholderKey && ai.provider && ai.provider !== "") {
    try {
      const provider = createProvider(ai.provider);
      const modelConfig = {
        provider: ai.provider,
        apiKey: ai.apiKey,
        model: ai.model,
        maxTokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: DEFAULT_TEMPERATURE,
        timeoutMs: DEFAULT_TIMEOUT_MS,
      };
      const result = await provider.complete(options.messages, modelConfig);
      return result;
    } catch (err) {
      logger.warn(
        "[ai] external provider call failed, using intelligent educational engine fallback",
        {
          error: err.message,
          provider: ai.provider,
        },
      );
      // Fall through to educational engine
    }
  }

  // Handle Practice requests
  if (isPracticeRequest) {
    return JSON.stringify({
      questions: [
        {
          type: "mcq",
          question:
            "What is the primary green pigment in plant leaves responsible for absorbing light energy?",
          options: ["Chlorophyll", "Carotenoid", "Anthocyanin", "Xanthophyll"],
          correctAnswer: "Chlorophyll",
          explanation:
            "Chlorophyll absorbs solar radiation during light-dependent reactions of photosynthesis.",
        },
        {
          type: "true_false",
          question:
            "Light reaction takes place in the thylakoid membranes of chloroplasts.",
          correctAnswer: "True",
          explanation:
            "Thylakoid membranes contain the photosystem complexes for light absorption.",
        },
        {
          type: "mcq",
          question:
            "What gas is released as a vital byproduct during the light reaction of photosynthesis?",
          options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
          correctAnswer: "Oxygen",
          explanation:
            "Photolysis (splitting) of water yields oxygen gas as a byproduct.",
        },
        {
          type: "mcq",
          question:
            "Name the primary enzyme that fixes CO2 into carbohydrates during the Calvin Cycle.",
          options: ["RuBisCO", "PEP Carboxylase", "ATP Synthase", "Amylase"],
          correctAnswer: "RuBisCO",
          explanation:
            "RuBisCO is the primary catalytic enzyme for carbon fixation in photosynthetic organisms.",
        },
        {
          type: "true_false",
          question:
            "ATP and NADPH produced in light reactions are consumed in the dark reactions.",
          correctAnswer: "True",
          explanation:
            "Chemical energy stored in ATP and NADPH powers the reduction of CO2 into glucose.",
        },
        {
          type: "mcq",
          question: "Which organelle is known as the powerhouse of the cell?",
          options: ["Mitochondria", "Nucleus", "Ribosome", "Golgi Apparatus"],
          correctAnswer: "Mitochondria",
          explanation:
            "Mitochondria generate cellular energy currency in the form of ATP.",
        },
        {
          type: "true_false",
          question:
            "Newton's First Law states an object at rest stays at rest unless acted upon by a net external force.",
          correctAnswer: "True",
          explanation: "This is the fundamental principle of inertia.",
        },
        {
          type: "short_answer",
          question:
            "What is the SI unit of electrical potential difference in Ohm's Law (V = IR)?",
          correctAnswer: "Volt",
          explanation:
            "Volt (V) is the international standard unit measuring electromotive force.",
        },
        {
          type: "mcq",
          question:
            "What is the formula representing Newton's Second Law of Motion?",
          options: ["F = m × a", "E = mc²", "V = I × R", "p = m × v"],
          correctAnswer: "F = m × a",
          explanation: "Force equals mass times acceleration (F = ma).",
        },
        {
          type: "true_false",
          question:
            "Python uses indentation (whitespace) to define code blocks rather than curly braces.",
          correctAnswer: "True",
          explanation:
            "Indentation is syntactically mandatory in Python for functions, loops, and conditions.",
        },
      ],
    });
  }

  // Handle Tutor Learning Doubts & Concepts
  let extractedQuery = "";
  if (typeof options.messages === "object" && options.messages?.user) {
    extractedQuery = options.messages.user
      .replace(/^Student question:\s*/i, "")
      .replace(/\n\nReturn the JSON.*$/is, "")
      .trim();
  } else if (typeof options.messages === "string") {
    extractedQuery = options.messages;
  }

  const educationalData = generateEducationalResponse(extractedQuery, msgStr);
  return JSON.stringify(educationalData);
}

export async function generateLearningResponse(input) {
  const grounding = await buildGrounding(input.userId, input.question);
  const raw = await completeProviderRequest({
    messages: buildTutorMessages(input.question, grounding),
  });
  const response = normalizeProviderResponse(input.question, raw);
  if (grounding.sources.length > 0) {
    response.sources = grounding.sources;
  }
  return response;
}
