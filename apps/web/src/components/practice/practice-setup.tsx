"use client";

import * as React from "react";

import type {
  PracticeConfig,
  PracticeDifficulty,
  PracticeQuestionMode,
} from "@novilearn/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ChoiceOption<T> {
  value: T;
  label: string;
}

function ChoiceGroup<T>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-foreground">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => (
          <Button
            key={String(option.value)}
            type="button"
            variant={value === option.value ? "default" : "outline"}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}

const QUESTION_COUNTS = [5, 10] as const;

const DIFFICULTIES: readonly ChoiceOption<PracticeDifficulty>[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const QUESTION_TYPES: readonly ChoiceOption<PracticeQuestionMode>[] = [
  { value: "mixed", label: "Mixed" },
  { value: "mcq", label: "MCQ" },
  { value: "true_false", label: "True/False" },
  { value: "short_answer", label: "Short Answer" },
];

interface PracticeSetupProps {
  initialTopic?: string;
  onSubmit: (config: PracticeConfig) => void;
}

export function PracticeSetup({ initialTopic, onSubmit }: PracticeSetupProps) {
  const [topic, setTopic] = React.useState(initialTopic ?? "");
  const [questionCount, setQuestionCount] = React.useState<5 | 10>(5);
  const [difficulty, setDifficulty] =
    React.useState<PracticeDifficulty>("medium");
  const [questionType, setQuestionType] =
    React.useState<PracticeQuestionMode>("mixed");

  const canSubmit = topic.trim().length >= 2;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    onSubmit({
      topic: topic.trim(),
      questionCount,
      difficulty,
      questionType,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Start practicing</CardTitle>
        <CardDescription>
          Pick a topic and a few options. NoviLearn will create questions for
          you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            id="practice-topic"
            label="What do you want to practice?"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. JavaScript Functions"
            {...(topic !== "" && !canSubmit
              ? { hint: "Topic must be at least 2 characters." }
              : {})}
            autoComplete="off"
          />

          <ChoiceGroup<5 | 10>
            label="Question count"
            value={questionCount}
            options={QUESTION_COUNTS.map((count) => ({
              value: count,
              label: String(count),
            }))}
            onChange={setQuestionCount}
          />

          <ChoiceGroup<PracticeDifficulty>
            label="Difficulty"
            value={difficulty}
            options={DIFFICULTIES}
            onChange={setDifficulty}
          />

          <ChoiceGroup<PracticeQuestionMode>
            label="Question type"
            value={questionType}
            options={QUESTION_TYPES}
            onChange={setQuestionType}
          />

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full sm:w-auto"
          >
            Start Practice
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
