"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import type { PracticeQuestion, PracticeResult } from "@novilearn/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PracticeResultViewProps {
  result: PracticeResult;
  questions: PracticeQuestion[];
  onPracticeAgain: () => void;
  onLearnTopic: () => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-muted/50 px-4 py-3">
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export function PracticeResultView({
  result,
  questions,
  onPracticeAgain,
  onLearnTopic,
}: PracticeResultViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardDescription>Topic · {result.topic}</CardDescription>
          <CardTitle className="text-3xl">Practice Complete</CardTitle>
          <p className="mt-2 text-5xl font-bold tracking-tight text-foreground">
            {result.score} / {result.totalQuestions}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Correct" value={String(result.correctAnswers)} />
            <Stat label="Incorrect" value={String(result.incorrectAnswers)} />
            <Stat label="Accuracy" value={`${result.accuracy}%`} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={onPracticeAgain}>
              Practice Again
            </Button>
            <Button type="button" variant="outline" onClick={onLearnTopic}>
              Learn This Topic
            </Button>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="practice-breakdown-heading">
        <Card>
          <CardHeader>
            <CardTitle id="practice-breakdown-heading" className="text-lg">
              Question breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {result.results.map((entry, index) => {
                const question = questions.find(
                  (candidate) => candidate.id === entry.questionId,
                );
                return (
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
                      <p
                        className="text-sm font-medium leading-snug"
                        id={`practice-result-q-${entry.questionId}`}
                      >
                        {index + 1}. {question?.question ?? entry.correctAnswer}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Correct answer: {entry.correctAnswer}
                        {!entry.correct && ` · Your answer: ${entry.answer}`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
