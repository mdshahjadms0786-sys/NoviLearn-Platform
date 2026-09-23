"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export function PracticeFeedback({
  correct,
  explanation,
  correctAnswer,
  isLast,
  onNext,
  loading,
}) {
  return (
    <Card>
      <CardHeader className={correct ? "bg-success/10" : "bg-destructive/10"}>
        <div className="flex items-center gap-3">
          {correct ? (
            <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
          ) : (
            <XCircle className="h-9 w-9 text-destructive" aria-hidden="true" />
          )}
          <div>
            <CardTitle className="text-2xl">
              {correct ? "Correct" : "Incorrect"}
            </CardTitle>
            {!correct && (
              <CardDescription>Correct answer: {correctAnswer}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div>
          <h3 className="mb-1 text-sm font-medium text-foreground">
            Explanation
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {explanation}
          </p>
        </div>
        <Button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {isLast ? "See Results" : "Next Question"}
        </Button>
      </CardContent>
    </Card>
  );
}
