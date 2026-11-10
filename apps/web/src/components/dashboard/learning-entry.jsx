"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
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

const SUGGESTED_TOPICS = [
  "Photosynthesis",
  "Newton's Laws",
  "Python Functions",
  "DNA Replication",
  "Ohm's Law",
];

export function LearningEntry() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const question = query.trim();
    if (question !== "") {
      router.push(`/learn?q=${encodeURIComponent(question)}`);
    }
  };

  const handleSelectTopic = (topic) => {
    router.push(`/learn?q=${encodeURIComponent(topic)}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          What do you want to learn today?
        </CardTitle>
        <CardDescription>
          Ask NoviLearn for a topic and get a structured explanation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="learning-query" className="sr-only">
            What do you want to learn today?
          </label>
          <Input
            id="learning-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. Introduction to Python"
            autoComplete="off"
            className="flex-1"
          />
          <Button type="submit">
            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
            Ask NoviLearn
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-muted-foreground">
            Try asking:
          </span>
          {SUGGESTED_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => handleSelectTopic(topic)}
              className="rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              {topic}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
