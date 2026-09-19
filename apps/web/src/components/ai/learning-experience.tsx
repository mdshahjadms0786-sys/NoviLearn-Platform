"use client";

import type { LearningResponse } from "@novilearn/types";

import { ContinueLearning } from "@/components/ai/continue-learning";
import { FollowUpQuestions } from "@/components/ai/follow-up-questions";
import { LearningSection } from "@/components/ai/learning-section";
import { RelatedConcepts } from "@/components/ai/related-concepts";
import { VisualLearning } from "@/components/ai/visual-learning";

interface LearningExperienceProps {
  response: LearningResponse;
  onAskFollowUp: (question: string) => void;
}

export function LearningExperience({
  response,
  onAskFollowUp,
}: LearningExperienceProps) {
  const followUpSection = response.sections.find(
    (section) => section.type === "follow_ups",
  );
  const contentSections = response.sections.filter(
    (section) => section.type !== "follow_ups",
  );

  return (
    <div className="space-y-6" aria-live="polite">
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Your question
        </p>
        <p className="mt-1 font-medium leading-snug">{response.question}</p>
      </div>

      {contentSections.map((section) => (
        <LearningSection key={section.type} section={section} />
      ))}

      {response.visualLearning !== undefined && (
        <VisualLearning visual={response.visualLearning} />
      )}

      {response.relatedConcepts !== undefined &&
        response.relatedConcepts.length > 0 && (
          <RelatedConcepts concepts={response.relatedConcepts} />
        )}

      {response.nextLearning !== undefined &&
        response.nextLearning.length > 0 && (
          <ContinueLearning topics={response.nextLearning} />
        )}

      {followUpSection !== undefined &&
        followUpSection.items !== undefined &&
        followUpSection.items.length > 0 && (
          <FollowUpQuestions
            questions={followUpSection.items}
            onSelect={onAskFollowUp}
          />
        )}

      {response.disclaimer !== undefined && (
        <p className="text-xs text-muted-foreground">{response.disclaimer}</p>
      )}
    </div>
  );
}
