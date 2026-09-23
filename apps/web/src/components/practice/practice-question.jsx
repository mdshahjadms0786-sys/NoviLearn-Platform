"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
function QuestionOptions({ question, value, onAnswerChange }) {
  const options =
    question.type === "true_false"
      ? ["True", "False"]
      : (question.options ?? []);
  return (
    <RadioGroup
      label="Your answer"
      value={value}
      onValueChange={onAnswerChange}
      className="mt-2"
    >
      {options.map((option) => (
        <RadioGroupItem key={option} value={option} label={option} />
      ))}
    </RadioGroup>
  );
}
function ShortAnswerInput({ value, onAnswerChange, disabled }) {
  return (
    <Input
      id="practice-short-answer"
      label="Your answer"
      value={value}
      onChange={(event) => onAnswerChange(event.target.value)}
      placeholder="Type your answer"
      disabled={disabled}
      autoComplete="off"
      className="mt-1"
    />
  );
}
export function PracticeQuestionView({
  topic,
  question,
  index,
  total,
  value,
  onAnswerChange,
  onSubmit,
  submitting,
  disabled,
}) {
  const canSubmit = !submitting && !disabled && value.trim() !== "";
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          {topic} · Question {index + 1} of {total}
        </CardDescription>
        <CardTitle className="text-xl leading-snug">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {question.type === "short_answer" ? (
          <ShortAnswerInput
            value={value}
            onAnswerChange={onAnswerChange}
            disabled={disabled}
          />
        ) : (
          <QuestionOptions
            question={question}
            value={value}
            onAnswerChange={onAnswerChange}
          />
        )}

        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full sm:w-auto"
        >
          Submit Answer
        </Button>
      </CardContent>
    </Card>
  );
}
