"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

function ChoiceGroup({ label, value, options, onChange }) {
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

const QUESTION_COUNTS = [5, 10];

const DIFFICULTIES = [
  {
    value: "easy",
    label: "Easy",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "hard",
    label: "Hard",
  },
];

const QUESTION_TYPES = [
  {
    value: "mixed",
    label: "Mixed",
  },
  {
    value: "mcq",
    label: "MCQ",
  },
  {
    value: "true_false",
    label: "True/False",
  },
  {
    value: "short_answer",
    label: "Short Answer",
  },
];

const SUGGESTED_TOPICS = [
  "Newton's Laws",
  "Photosynthesis",
  "Python Functions",
  "DNA Replication",
  "Ohm's Law",
];

export function PracticeSetup({ initialTopic, onSubmit }) {
  const [topic, setTopic] = React.useState(initialTopic ?? "");
  const [questionCount, setQuestionCount] = React.useState(5);
  const [difficulty, setDifficulty] = React.useState("medium");
  const [questionType, setQuestionType] = React.useState("mixed");
  const [isAdaptive, setIsAdaptive] = React.useState(false);

  const canSubmit = topic.trim().length >= 2;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    onSubmit({
      topic: topic.trim(),
      questionCount,
      difficulty,
      questionType,
      isAdaptive,
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
          <div className="flex flex-col gap-2">
            <Input
              id="practice-topic"
              label="What do you want to practice?"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Enter topic name..."
              {...(topic !== "" && !canSubmit
                ? {
                    hint: "Topic must be at least 2 characters.",
                  }
                : {})}
              autoComplete="off"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground">Try:</span>
              {SUGGESTED_TOPICS.map((suggested) => (
                <button
                  key={suggested}
                  type="button"
                  onClick={() => setTopic(suggested)}
                  className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
                >
                  {suggested}
                </button>
              ))}
            </div>
          </div>

          <ChoiceGroup
            label="Question count"
            value={questionCount}
            options={QUESTION_COUNTS.map((count) => ({
              value: count,
              label: String(count),
            }))}
            onChange={setQuestionCount}
          />

          <ChoiceGroup
            label="Difficulty"
            value={difficulty}
            options={DIFFICULTIES}
            onChange={setDifficulty}
          />

          <ChoiceGroup
            label="Question type"
            value={questionType}
            options={QUESTION_TYPES}
            onChange={setQuestionType}
          />

          <div className="flex flex-col gap-2 rounded-lg border p-4">
            <Switch
              id="adaptive-mode"
              checked={isAdaptive}
              onCheckedChange={setIsAdaptive}
              label="Adaptive Mode"
              description="Dynamically adjust question difficulty based on your performance."
            />
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full sm:w-auto mt-2"
          >
            Start Practice
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
