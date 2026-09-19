"use client";

import { Sparkles } from "lucide-react";
import * as React from "react";

import type { LearningResponse } from "@novilearn/types";

import { LearningExperience } from "@/components/ai/learning-experience";
import { QuestionForm } from "@/components/ai/question-form";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { ApiClientError, aiApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

type TutorStatus = "idle" | "loading" | "success" | "error";

const LOADING_STAGES = [
  "Understanding your question...",
  "Preparing your explanation...",
] as const;

interface AiTutorProps {
  initialQuestion?: string | undefined;
}

export function AiTutor({ initialQuestion }: AiTutorProps) {
  const token = useAuthStore((s) => s.token);
  const [question, setQuestion] = React.useState(initialQuestion ?? "");
  const [status, setStatus] = React.useState<TutorStatus>("idle");
  const [response, setResponse] = React.useState<LearningResponse | null>(null);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [lastQuestion, setLastQuestion] = React.useState("");
  const [loadingStage, setLoadingStage] = React.useState(0);

  const canSubmit = question.trim().length >= 2 && status !== "loading";

  React.useEffect(() => {
    if (status !== "loading") {
      return;
    }
    setLoadingStage(0);
    const interval = window.setInterval(() => {
      setLoadingStage((stage) =>
        Math.min(stage + 1, LOADING_STAGES.length - 1),
      );
    }, 2500);
    return () => window.clearInterval(interval);
  }, [status]);

  const submit = async (value: string): Promise<void> => {
    if (status === "loading" || token === null) {
      return;
    }
    const questionToAsk = value.trim();
    if (questionToAsk === "") {
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setLastQuestion(questionToAsk);
    setResponse(null);

    try {
      const result = await aiApi.learn(token, { question: questionToAsk });
      setResponse(result);
      setStatus("success");
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.error.message
          : "We could not process your question right now.";
      setErrorMessage(message);
      setStatus("error");
    }
  };

  const handleAsk = (value: string) => {
    void submit(value);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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
        onSubmit={handleAsk}
        disabled={status === "loading"}
        canSubmit={canSubmit}
      />

      {status === "idle" && (
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
      )}

      {status === "loading" && (
        <LoadingState
          message={
            LOADING_STAGES[loadingStage] ?? "Understanding your question..."
          }
        />
      )}

      {status === "error" && (
        <ErrorState
          title="Something went wrong while preparing your lesson"
          description={errorMessage}
          action={
            <Button
              onClick={() => void submit(lastQuestion)}
              disabled={lastQuestion === ""}
            >
              Try again
            </Button>
          }
        />
      )}

      {status === "success" && response !== null && (
        <>
          <LearningExperience
            response={response}
            onAskFollowUp={(questionToAsk) => {
              setQuestion(questionToAsk);
              void submit(questionToAsk);
            }}
          />
          <QuestionForm
            fieldId="ai-question-next"
            title="Ask another question"
            description="Keep exploring a new concept with NoviLearn."
            placeholder="Type your next question"
            buttonLabel="Ask NoviLearn"
            question={question}
            onChange={setQuestion}
            onSubmit={handleAsk}
            disabled={false}
            canSubmit={canSubmit}
          />
        </>
      )}
    </div>
  );
}
