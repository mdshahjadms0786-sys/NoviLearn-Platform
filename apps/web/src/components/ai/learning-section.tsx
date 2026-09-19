"use client";

import type { LearningResponseSection } from "@novilearn/types";

import { Markdown } from "@/components/ai/markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LearningSectionProps {
  section: LearningResponseSection;
}

export function LearningSection({ section }: LearningSectionProps) {
  return (
    <section aria-labelledby={`learning-section-${section.type}`}>
      <Card>
        <CardHeader>
          <CardTitle
            id={`learning-section-${section.type}`}
            className="text-lg"
          >
            {section.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {section.content !== undefined && <Markdown text={section.content} />}
          {section.items !== undefined && (
            <>
              {section.content !== undefined && <div className="h-2" />}
              <ul className="list-disc space-y-1 pl-5">
                {section.items.map((item, index) => (
                  <li key={index}>
                    <Markdown text={item} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
