"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import type {
  PracticeEvaluation,
  PracticeConfig,
  PracticeResult,
  PracticeSet,
} from "@novilearn/types";

import { PracticeFeedback } from "@/components/practice/practice-feedback";
import { PracticeQuestionView } from "@/components/practice/practice-question";
import { PracticeResultView } from "@/components/practice/practice-result";
import { PracticeSetup } from "@/components/practice/practice-setup";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { ApiClientError, practiceApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

type TutorStatus = "setup" | "loading" | "error" | "ready" | "complete";
type PendingAction = "generate" | "answer" | "complete";

const LOADING_STAGES = [
  "Preparing your practice...",
  "Creating questions...",
] as const;

const ERROR_TITLES: Record<PendingAction, string> = {
  generate: "Something went wrong while preparing your practice",
  answer: "Something went wrong while evaluating your answer",
  complete: "Something went wrong while finishing your practice",
};

interface PracticeTutorProps {
  initialTopic?: string | undefined;
}

export function PracticeTutor({ initialTopic }: PracticeTutorProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const [status, setStatus] = React.useState<TutorStatus>("setup");
  const [setupTopic, setSetupTopic] = React.useState(initialTopic ?? "");
  const [loadingStage, setLoadingStage] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [pendingAction, setPendingAction] =
    React.useState<PendingAction>("generate");

  const [practiceSet, setPracticeSet] = React.useState<PracticeSet | null>(
    null,
  );
  const [index, setIndex] = React.useState(0);
  const [answerValue, setAnswerValue] = React.useState("");
  const [feedback, setFeedback] = React.useState<PracticeEvaluation | null>(
    null,
  );
  const [evaluating, setEvaluating] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);
  const [result, setResult] = React.useState<PracticeResult | null>(null);
  const [lastConfig, setLastConfig] = React.useState<PracticeConfig | null>(
    null,
  );

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

  const handleStart = async (config: PracticeConfig): Promise<void> => {
    if (token === null) {
      return;
    }
    setLastConfig(config);
    setPendingAction("generate");
    setErrorMessage("");
    setStatus("loading");
    setPracticeSet(null);

    try {
      const generated = await practiceApi.generate(token, config);
      setPracticeSet(generated);
      setIndex(0);
      setAnswerValue("");
      setFeedback(null);
      setResult(null);
      setStatus("ready");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.error.message
          : "We could not prepare your practice right now.",
      );
      setStatus("error");
    }
  };

  const submitAnswer = async (): Promise<void> => {
    if (token === null || practiceSet === null || evaluating || completing) {
      return;
    }
    const question = practiceSet.questions[index];
    if (question === undefined || answerValue.trim() === "") {
      return;
    }

    setPendingAction("answer");
    setErrorMessage("");
    setEvaluating(true);
    try {
      const evaluation = await practiceApi.answer(token, {
        sessionId: practiceSet.sessionId,
        questionId: question.id,
        answer: answerValue.trim(),
      });
      setFeedback(evaluation);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.error.message
          : "We could not evaluate your answer right now.",
      );
      setPendingAction("answer");
      setStatus("error");
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = async (): Promise<void> => {
    if (token === null || practiceSet === null || completing) {
      return;
    }
    const isLast = index === practiceSet.questions.length - 1;
    if (!isLast) {
      setIndex((current) => current + 1);
      setAnswerValue("");
      setFeedback(null);
      return;
    }

    setPendingAction("complete");
    setErrorMessage("");
    setCompleting(true);
    try {
      const completed = await practiceApi.complete(
        token,
        practiceSet.sessionId,
      );
      setResult(completed);
      setStatus("complete");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.error.message
          : "We could not finish your practice right now.",
      );
      setPendingAction("complete");
      setStatus("error");
    } finally {
      setCompleting(false);
    }
  };

  const restart = (topic?: string): void => {
    setSetupTopic(topic ?? "");
    setStatus("setup");
    setPracticeSet(null);
    setIndex(0);
    setAnswerValue("");
    setFeedback(null);
    setResult(null);
    setErrorMessage("");
  };

  const handleRetry = (): void => {
    if (pendingAction === "generate") {
      if (lastConfig !== null) {
        void handleStart(lastConfig);
      }
      return;
    }
    if (pendingAction === "answer") {
      void submitAnswer();
      return;
    }
    void handleNext();
  };

  const handleLearnTopic = (): void => {
    if (practiceSet !== null) {
      router.push(`/learn?q=${encodeURIComponent(practiceSet.topic)}`);
    }
  };

  const question = practiceSet?.questions[index];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice</h1>
        <p className="mt-2 text-muted-foreground">
          Test your understanding with interactive questions.
        </p>
      </div>

      {status === "setup" && (
        <PracticeSetup
          key={setupTopic}
          initialTopic={setupTopic}
          onSubmit={(config) => void handleStart(config)}
        />
      )}

      {status === "loading" && (
        <LoadingState
          message={LOADING_STAGES[loadingStage] ?? "Preparing your practice..."}
        />
      )}

      {status === "error" && (
        <ErrorState
          title={ERROR_TITLES[pendingAction]}
          description={errorMessage}
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleRetry}>Try Again</Button>
              <Button variant="outline" onClick={() => restart(setupTopic)}>
                Back to Practice
              </Button>
            </div>
          }
        />
      )}

      {status === "ready" &&
        practiceSet !== null &&
        question !== undefined &&
        (feedback === null ? (
          <PracticeQuestionView
            topic={practiceSet.topic}
            question={question}
            index={index}
            total={practiceSet.questions.length}
            value={answerValue}
            onAnswerChange={setAnswerValue}
            onSubmit={() => void submitAnswer()}
            submitting={evaluating}
            disabled={completing}
          />
        ) : (
          <PracticeFeedback
            correct={feedback.correct}
            explanation={feedback.explanation}
            correctAnswer={feedback.correctAnswer}
            isLast={index === practiceSet.questions.length - 1}
            onNext={() => void handleNext()}
            loading={completing}
          />
        ))}

      {status === "complete" && result !== null && practiceSet !== null && (
        <PracticeResultView
          result={result}
          questions={practiceSet.questions}
          onPracticeAgain={() => restart(result.topic)}
          onLearnTopic={handleLearnTopic}
        />
      )}
    </div>
  );
}
