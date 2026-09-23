"use client";

import type { KnowledgeSource } from "@novilearn/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LearningSourcesProps {
  sources: KnowledgeSource[];
}

export function LearningSources({ sources }: LearningSourcesProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="learning-sources-heading">
      <Card>
        <CardHeader>
          <CardTitle id="learning-sources-heading" className="text-lg">
            Sources
          </CardTitle>
          <CardDescription>
            This answer was grounded in the following knowledge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {sources.map((source, index) => (
              <li key={index} className="text-sm">
                <p className="font-medium">
                  {index + 1}. {source.title}
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  {source.topic} · {source.source} · {source.confidence} confidence
                </p>
                <p className="mt-1 leading-snug text-muted-foreground">
                  &ldquo;{source.excerpt}&rdquo;
                </p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </section>
  );
}