"use client";

import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

import type { PracticeSessionDetail } from "@novilearn/types";

import { formatDateTime, truncateTopic } from "@/components/progress/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/states";

interface PracticeSessionDetailViewProps {
  detail: PracticeSessionDetail | null;
  loading: boolean;
  error: string;
  onBack: () => void;
  onRetry: () => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-muted/50 px-4 py-3">
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export function PracticeSessionDetailView({
  detail,
  loading,
  error,
  onBack,
  onRetry,
}: PracticeSessionDetailViewProps) {
  if (loading) {
    return <LoadingState message="Loading practice details..." />;
  }

  if (detail === null || error !== "") {
    return (
      <ErrorState
        title="Could not load this practice session"
        description={error || "Please try again."}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={onRetry}>
              Try again
            </Button>
            <Button type="button" variant="outline" onClick={onBack}>
              Back to progress
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button type="button" variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Back to progress
      </Button>

      <Card>
        <CardHeader className="text-center">
          <CardDescription>
            Topic · {truncateTopic(detail.topic, 80)}
          </CardDescription>
          <CardTitle className="text-3xl">Practice Result</CardTitle>
          <p className="mt-2 text-5xl font-bold tracking-tight text-foreground">
            {detail.score} / {detail.totalQuestions}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDateTime(detail.completedAt)}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Correct" value={String(detail.correctAnswers)} />
            <Stat label="Incorrect" value={String(detail.incorrectAnswers)} />
            <Stat label="Accuracy" value={`${detail.accuracy}%`} />
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Difficulty</dt>
              <dd className="capitalize">{detail.difficulty}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Question type</dt>
              <dd className="capitalize">
                {detail.questionType.replace("_", " ")}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <section aria-labelledby="practice-detail-breakdown-heading">
        <Card>
          <CardHeader>
            <CardTitle
              id="practice-detail-breakdown-heading"
              className="text-lg"
            >
              Question breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detail.results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No question details were recorded for this session.
              </p>
            ) : (
              <ol className="space-y-3">
                {detail.results.map((entry, index) => (
                  <li
                    key={entry.questionId}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    {entry.correct ? (
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0 text-success"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle
                        className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
                        aria-hidden="true"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug text-foreground">
                        {index + 1}. {entry.question}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Correct answer: {entry.correctAnswer}
                        {!entry.correct && ` · Your answer: ${entry.answer}`}
                      </p>
                      {entry.explanation && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {entry.explanation}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
