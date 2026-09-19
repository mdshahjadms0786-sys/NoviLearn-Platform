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

export function LearningEntry() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = query.trim();
    if (question !== "") {
      router.push(`/learn?q=${encodeURIComponent(question)}`);
    }
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
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
