export type UUID = string & { readonly __brand: unique symbol };

export function uuid(value: string): UUID {
  return value as UUID;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ResponseMeta & {
    pagination: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  checks: Record<string, HealthCheck>;
}

export interface HealthCheck {
  status: HealthStatus;
  latency?: number;
  details?: Record<string, unknown>;
}

export type UserRole = "student";

export interface User {
  id: UUID;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export type Environment = "development" | "staging" | "production";

export interface AppConfig {
  env: Environment;
  port: number;
  apiUrl: string;
  webUrl: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  ai: AiConfig;
  embeddings: EmbeddingConfig;
  rag: RagConfig;
  sentryDsn: string;
  logLevel: LogLevel;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export type AiProviderName = "openai" | "anthropic";

export interface AiConfig {
  provider: AiProviderName | "";
  apiKey: string;
  model: string;
}

export type EmbeddingProviderName = "openai" | "local";

export interface EmbeddingConfig {
  provider: EmbeddingProviderName | "";
  apiKey: string;
  model: string;
  dimension: number;
}

export interface RagConfig {
  topK: number;
  minScore: number;
  enabled: boolean;
}

export interface KnowledgeSource {
  title: string;
  topic: string;
  source: string;
  excerpt: string;
  confidence: number;
}

export type LearningSectionType =
  | "summary"
  | "explanation"
  | "key_points"
  | "example"
  | "analogy"
  | "follow_ups";

export interface LearningQuestion {
  question: string;
}

export interface LearningResponseSection {
  type: LearningSectionType;
  title: string;
  content?: string;
  items?: string[];
}

export type VisualLearningType = "flow" | "steps" | "chain";

export interface VisualLearningNode {
  label: string;
  details?: string;
}

export interface VisualLearningEdge {
  from: number;
  to: number;
  label?: string;
}

export interface VisualLearning {
  type: VisualLearningType;
  title: string;
  nodes: VisualLearningNode[];
  edges: VisualLearningEdge[];
}

export interface LearningResponse {
  question: string;
  sections: LearningResponseSection[];
  relatedConcepts?: string[];
  nextLearning?: string[];
  visualLearning?: VisualLearning;
  sources?: KnowledgeSource[];
  disclaimer?: string;
}

export type PracticeQuestionType = "mcq" | "true_false" | "short_answer";

export type PracticeDifficulty = "easy" | "medium" | "hard";

export type PracticeQuestionMode = "mixed" | PracticeQuestionType;

export interface PracticeConfig {
  topic: string;
  questionCount: 5 | 10;
  difficulty: PracticeDifficulty;
  questionType: PracticeQuestionMode;
}

export interface PracticeQuestion {
  id: string;
  type: PracticeQuestionType;
  question: string;
  options?: string[];
}

export interface PracticeSet {
  sessionId: string;
  topic: string;
  config: PracticeConfig;
  questions: PracticeQuestion[];
}

export interface PracticeAnswerInput {
  sessionId: string;
  questionId: string;
  answer: string;
}

export interface PracticeEvaluation {
  questionId: string;
  correct: boolean;
  explanation: string;
  correctAnswer: string;
}

export interface PracticeQuestionResult {
  questionId: string;
  correct: boolean;
  answer: string;
  correctAnswer: string;
  explanation: string;
}

export interface PracticeResult {
  sessionId: string;
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  score: number;
  results: PracticeQuestionResult[];
}

export interface LearningActivity {
  id: string;
  topic: string;
  type: "learn";
  createdAt: string;
}

export type ActivitySource = "learn" | "practice";

export interface RecentActivityItem {
  id: string;
  type: ActivitySource;
  topic: string;
  at: string;
}

export interface ProgressSummary {
  learningActivityCount: number;
  practiceSessionCount: number;
  uniqueTopicCount: number;
  learnedTopicCount: number;
  practicedTopicCount: number;
  totalAnswers: number;
  totalCorrectAnswers: number;
  averageAccuracy: number | null;
  recentActivity: RecentActivityItem[];
}

export type MasteryState = "NOT_STARTED" | "LEARNING" | "PRACTICING" | "STRONG";

export interface TopicProgress {
  topic: string;
  learningCount: number;
  practiceCount: number;
  bestAccuracy: number | null;
  averageAccuracy: number | null;
  mastery: MasteryState;
  progress: number;
  lastActivityAt: string;
}

export type SuggestionKind =
  | "continue_learning"
  | "practice_again"
  | "review_weak_topic"
  | "related_next_topic";

export interface NextLearningSuggestion {
  kind: SuggestionKind;
  title: string;
  description: string;
  topic: string;
}

export interface PracticeSessionSummary {
  id: string;
  topic: string;
  questionCount: number;
  difficulty: PracticeDifficulty;
  questionType: PracticeQuestionMode;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  score: number;
  completedAt: string;
}

export interface PracticeHistoryResultRow {
  questionId: string;
  question: string;
  type: PracticeQuestionType;
  correct: boolean;
  answer: string;
  correctAnswer: string;
  explanation: string;
}

export interface PracticeSessionDetail extends PracticeSessionSummary {
  results: PracticeHistoryResultRow[];
}
