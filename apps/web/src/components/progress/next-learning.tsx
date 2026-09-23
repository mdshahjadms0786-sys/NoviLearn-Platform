"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { NextLearningSuggestion, SuggestionKind } from "@novilearn/types";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

function hrefForSuggestion(kind: SuggestionKind, topic: string): string {
  const encoded = encodeURIComponent(topic);
  return kind === "practice_again"
    ? `/practice?topic=${encoded}`
    : `/learn?q=${encoded}`;
}

interface NextLearningProps {
  suggestions: NextLearningSuggestion[];
}

export function NextLearning({ suggestions }: NextLearningProps) {
  return (
    <DashboardSection
      title="Suggested next"
      description="Deterministic suggestions built from your real progress."
    >
      {suggestions.length === 0 ? (
        <EmptyState
          title="No suggestions yet"
          description="Learn or practice a topic and we will suggest what to do next."
          action={
            <Button asChild>
              <Link href="/learn">Start learning</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.kind}
              className="flex items-center justify-between gap-3 rounded-lg border p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {suggestion.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                  {suggestion.description}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link
                  href={hrefForSuggestion(suggestion.kind, suggestion.topic)}
                >
                  Go
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}
