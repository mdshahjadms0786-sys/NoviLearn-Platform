"use client";

import { Sparkles, Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { LearningExperience } from "@/components/ai/learning-experience";
import { QuestionForm } from "@/components/ai/question-form";
import { SessionControls } from "@/components/ai/session-controls";
import { SessionSidebar } from "@/components/ai/session-sidebar";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { ApiClientError, apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const learningApi = {
  createSession: (token, question) =>
    apiClient("/learning", { method: "POST", body: { question }, token }),
  getSession: (token, id) => apiClient(`/learning/${id}`, { token }),
  listSessions: (token) => apiClient("/learning", { token }),
  sendMessage: (token, id, content, mode) =>
    apiClient(`/learning/${id}/messages`, {
      method: "POST",
      body: { content, mode },
      token,
    }),
  saveSession: (token, id) =>
    apiClient(`/learning/${id}/save`, { method: "POST", token }),
  unsaveSession: (token, id) =>
    apiClient(`/learning/${id}/save`, { method: "DELETE", token }),
};

const LOADING_STAGES = [
  "Understanding your question...",
  "Preparing your explanation...",
];

export function AiTutor({ initialQuestion }) {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [question, setQuestion] = React.useState(initialQuestion ?? "");
  const [followUpQuestion, setFollowUpQuestion] = React.useState("");

  const [status, setStatus] = React.useState("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [loadingStage, setLoadingStage] = React.useState(0);

  const [sessions, setSessions] = React.useState([]);
  const [currentSession, setCurrentSession] = React.useState(null);
  const [activeMode, setActiveMode] = React.useState("simple");
  const [isSaved, setIsSaved] = React.useState(false);

  const messagesEndRef = React.useRef(null);
  const contentTopRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    contentTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle loading animation
  React.useEffect(() => {
    if (status !== "loading") return;
    setLoadingStage(0);
    const interval = window.setInterval(() => {
      setLoadingStage((stage) =>
        Math.min(stage + 1, LOADING_STAGES.length - 1),
      );
    }, 2500);
    return () => window.clearInterval(interval);
  }, [status]);

  // Load session list
  const loadSessions = React.useCallback(async () => {
    if (!token) return;
    try {
      const data = await learningApi.listSessions(token);
      setSessions(data.sessions || data || []);
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  }, [token]);

  React.useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Initial load logic
  React.useEffect(() => {
    const sessionId = searchParams.get("session");
    const qParam = searchParams.get("q");

    if (sessionId) {
      handleLoadSession(sessionId);
    } else if (qParam && status === "idle") {
      setQuestion(qParam);
      handleCreateSession(qParam);
    } else if (initialQuestion && status === "idle") {
      setQuestion(initialQuestion);
      handleCreateSession(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, initialQuestion, token]);

  const handleCreateSession = async (q) => {
    if (status === "loading" || !token) return;
    const questionToAsk = q.trim();
    if (!questionToAsk) return;

    setStatus("loading");
    setErrorMessage("");
    setCurrentSession(null);

    try {
      const session = await learningApi.createSession(token, questionToAsk);
      setCurrentSession(session);
      setIsSaved(session.saved || false);
      setStatus("success");
      router.replace(`?session=${session.id}`, { scroll: false });
      loadSessions();
    } catch (error) {
      handleError(error);
    }
  };

  const handleLoadSession = async (id) => {
    if (!token) return;
    setStatus("loading");
    try {
      const session = await learningApi.getSession(token, id);
      setCurrentSession(session);
      setIsSaved(session.saved || false);
      setStatus("success");
    } catch (error) {
      handleError(error);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault?.();
    if (status === "loading" || !token || !currentSession) return;

    const content = followUpQuestion.trim();
    if (!content) return;

    // Optimistically add user message
    const tempMsg = { id: Date.now(), role: "user", content };
    setCurrentSession((prev) => ({
      ...prev,
      messages: [...(prev.messages || []), tempMsg],
    }));

    setFollowUpQuestion("");
    setStatus("loading");

    try {
      const updatedSession = await learningApi.sendMessage(
        token,
        currentSession.id,
        content,
        activeMode,
      );
      setCurrentSession(updatedSession);
      setStatus("success");
      setTimeout(scrollToBottom, 150);
    } catch (error) {
      handleError(error);
    }
  };

  const handleModeChange = (newMode) => {
    setActiveMode(newMode);
    setTimeout(scrollToTop, 50);
  };

  const handleError = (error) => {
    const message =
      error instanceof ApiClientError
        ? error.error?.message || error.message
        : "We could not process your request right now.";
    setErrorMessage(message);
    setStatus("error");
  };

  const toggleSave = async () => {
    if (!currentSession || !token) return;
    try {
      if (isSaved) {
        await learningApi.unsaveSession(token, currentSession.id);
        setIsSaved(false);
      } else {
        await learningApi.saveSession(token, currentSession.id);
        setIsSaved(true);
      }
    } catch (e) {
      console.error("Failed to toggle save", e);
    }
  };

  const startNewSession = () => {
    router.push("/learn");
    setCurrentSession(null);
    setQuestion("");
    setStatus("idle");
  };

  const canSubmitInitial = question.trim().length >= 2 && status !== "loading";
  const canSubmitFollowUp =
    followUpQuestion.trim().length >= 2 && status !== "loading";

  const renderMessages = () => {
    if (!currentSession?.messages) return null;

    return (
      <div className="flex flex-col gap-6 pb-24">
        {currentSession.messages.map((msg, i) => {
          if (msg.role === "user") {
            return (
              <div key={msg.id || i} className="flex w-full justify-end">
                <div className="max-w-[80%] rounded-2xl bg-primary px-5 py-3 text-primary-foreground shadow-sm">
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          } else {
            // Assistant message
            return (
              <div key={msg.id || i} className="flex w-full justify-start">
                <div className="w-full">
                  <LearningExperience
                    response={msg.metadata || msg.content || msg}
                    activeMode={activeMode}
                    onAskFollowUp={(q) => {
                      setFollowUpQuestion(q);
                    }}
                  />
                </div>
              </div>
            );
          }
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full gap-6">
      <SessionSidebar
        sessions={sessions}
        currentSessionId={currentSession?.id}
        onSelectSession={(id) => router.push(`?session=${id}`)}
        onNewSession={startNewSession}
      />

      <div className="flex flex-1 flex-col overflow-hidden max-w-4xl mx-auto w-full">
        {!currentSession && status === "idle" && (
          <div className="flex-1 space-y-6 pt-8 overflow-y-auto">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
              <p className="mt-2 text-muted-foreground">
                Ask NoviLearn anything and get a clear, structured explanation.
              </p>
            </div>

            <QuestionForm
              fieldId="ai-question"
              title="What do you want to learn today?"
              description="Ask a question and NoviLearn will explain it step by step."
              placeholder="e.g. Explain Newton's First Law in simple language"
              buttonLabel="Ask NoviLearn"
              question={question}
              onChange={setQuestion}
              onSubmit={(v) => handleCreateSession(v)}
              disabled={status === "loading"}
              canSubmit={canSubmitInitial}
            />

            <EmptyState
              className="border"
              icon={
                <Sparkles
                  className="h-8 w-8 text-muted-foreground"
                  aria-hidden="true"
                />
              }
              title="Ready when you are"
              description="Type a question above to get a structured lesson with key concepts, examples, and next steps."
            />
          </div>
        )}

        {(currentSession || status === "loading" || status === "error") && (
          <>
            {currentSession && (
              <div className="flex flex-col gap-4 border-b bg-background/95 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold truncate pr-4">
                    {currentSession.title || "Learning Session"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSave}
                    title={isSaved ? "Unsave" : "Save"}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <SessionControls
                  activeMode={activeMode}
                  onModeChange={handleModeChange}
                  disabled={status === "loading"}
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto pt-6 px-1">
              <div ref={contentTopRef} />
              {renderMessages()}

              {status === "loading" && (
                <div className="my-6">
                  <LoadingState
                    message={
                      LOADING_STAGES[loadingStage] ??
                      "Understanding your question..."
                    }
                  />
                </div>
              )}

              {status === "error" && (
                <div className="my-6">
                  <ErrorState
                    title="Something went wrong"
                    description={errorMessage}
                    action={
                      <Button onClick={() => setStatus("idle")}>Dismiss</Button>
                    }
                  />
                </div>
              )}
            </div>

            {currentSession && (
              <div className="mt-auto pt-4 pb-2 bg-background">
                <form
                  onSubmit={handleSendMessage}
                  className="flex w-full items-center gap-2 rounded-lg border bg-background p-1 pr-2 shadow-sm focus-within:ring-1 focus-within:ring-ring"
                >
                  <input
                    id="ai-follow-up"
                    type="text"
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    disabled={status === "loading"}
                    className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!canSubmitFollowUp}
                    className="shrink-0"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
