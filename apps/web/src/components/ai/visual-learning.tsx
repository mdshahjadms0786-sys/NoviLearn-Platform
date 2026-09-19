"use client";

import type { VisualLearning as VisualLearningData } from "@novilearn/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VisualLearningProps {
  visual: VisualLearningData;
}

export function VisualLearning({ visual }: VisualLearningProps) {
  const lastIndex = visual.nodes.length - 1;

  return (
    <section aria-labelledby="visual-learning-heading">
      <Card>
        <CardHeader>
          <CardTitle id="visual-learning-heading" className="text-lg">
            {visual.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-0">
            {visual.nodes.map((node, index) => (
              <li key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-semibold text-muted-foreground"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </div>
                  {index < lastIndex && (
                    <div
                      className="my-1 w-px flex-1 bg-border"
                      role="presentation"
                    />
                  )}
                </div>
                <div className={index < lastIndex ? "pb-5" : "pb-1"}>
                  <p className="font-medium">{node.label}</p>
                  {node.details !== undefined && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {node.details}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </section>
  );
}
