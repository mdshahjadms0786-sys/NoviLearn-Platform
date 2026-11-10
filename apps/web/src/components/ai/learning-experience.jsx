"use client";

import { ContinueLearning } from "@/components/ai/continue-learning";
import { FollowUpQuestions } from "@/components/ai/follow-up-questions";
import { LearningSection } from "@/components/ai/learning-section";
import { LearningSources } from "@/components/ai/learning-sources";
import { PracticeCta } from "@/components/ai/practice-cta";
import { RelatedConcepts } from "@/components/ai/related-concepts";
import { VisualLearning } from "@/components/ai/visual-learning";

export function LearningExperience({
  response,
  activeMode = "simple",
  onAskFollowUp,
}) {
  if (!response) return null;

  // Normalize response whether it's a string, message object, metadata, or raw JSON
  let data = response;
  if (typeof response === "string") {
    try {
      data = JSON.parse(response);
    } catch {
      data = {
        question: "Topic explanation",
        sections: [
          { type: "explanation", title: "Explanation", body: response },
        ],
      };
    }
  }

  // If passed the whole message object
  if (data?.metadata && typeof data.metadata === "object") {
    data = data.metadata;
  }

  const questionTitle = data?.question || "Question";
  const visual = data?.visualLearning || data?.visualRepresentation;
  const relatedConcepts = data?.relatedConcepts || [];
  const sources = data?.sources || [];
  const nextLearning = data?.nextLearning || data?.nextTopics || [];

  // Check if mode-specific content exists
  const modeData = data?.modes?.[activeMode] || null;

  // Extract base sections or construct from direct fields
  let sections = Array.isArray(data?.sections) ? [...data.sections] : [];
  if (sections.length === 0) {
    if (data?.summary) {
      sections.push({ type: "summary", title: "Summary", body: data.summary });
    }
    if (data?.explanation) {
      sections.push({
        type: "explanation",
        title: "Explanation",
        body: data.explanation,
      });
    }
    if (Array.isArray(data?.keyPoints) && data.keyPoints.length > 0) {
      sections.push({
        type: "key_points",
        title: "Key Points",
        items: data.keyPoints,
      });
    }
    if (data?.example) {
      sections.push({ type: "example", title: "Example", body: data.example });
    }
    if (data?.analogy) {
      sections.push({ type: "analogy", title: "Analogy", body: data.analogy });
    }
    if (Array.isArray(data?.followUps) && data.followUps.length > 0) {
      sections.push({
        type: "follow_ups",
        title: "Follow-up Questions",
        items: data.followUps,
      });
    }
  }

  // If modeData is available, update the summary and explanation for the active mode
  if (modeData) {
    const summaryIdx = sections.findIndex((s) => s.type === "summary");
    const modeTitle =
      activeMode === "detailed"
        ? "Detailed academic breakdown"
        : activeMode === "example"
          ? "Practical examples & applications"
          : activeMode === "visual"
            ? "Visual flowchart & process"
            : activeMode === "exam"
              ? "Exam high-yield points & formulas"
              : activeMode === "hinglish"
                ? "Hinglish explanation"
                : "Simple explanation";

    if (summaryIdx !== -1) {
      sections[summaryIdx] = {
        type: "summary",
        title: modeTitle,
        body: modeData.summary,
      };
    } else {
      sections.unshift({
        type: "summary",
        title: modeTitle,
        body: modeData.summary,
      });
    }

    const expIdx = sections.findIndex((s) => s.type === "explanation");
    if (expIdx !== -1) {
      sections[expIdx] = {
        type: "explanation",
        title: `${modeTitle} details`,
        body: modeData.explanation,
      };
    } else {
      sections.splice(1, 0, {
        type: "explanation",
        title: `${modeTitle} details`,
        body: modeData.explanation,
      });
    }
  }

  const followUpSection = sections.find((s) => s.type === "follow_ups");
  const contentSections = sections.filter((s) => s.type !== "follow_ups");
  const followUpItems =
    followUpSection?.items || followUpSection?.questions || [];

  return (
    <div className="space-y-6" aria-live="polite">
      {/* Question Header */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Topic / Question
          </p>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-primary">
            {activeMode} mode
          </span>
        </div>
        <p className="mt-1 font-medium leading-snug">{questionTitle}</p>
      </div>

      {/* If Visual mode is active, display the flowchart prominently at the very top */}
      {activeMode === "visual" && visual !== undefined && visual !== null && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
            Interactive Visual Flowchart
          </p>
          <VisualLearning visual={visual} />
        </div>
      )}

      {/* Content Sections */}
      {contentSections.map((section, idx) => (
        <LearningSection
          key={`${section.type}-${activeMode}-${idx}`}
          section={section}
        />
      ))}

      {/* If not in visual mode, display the visual diagram in regular sequence */}
      {activeMode !== "visual" && visual !== undefined && visual !== null && (
        <VisualLearning visual={visual} />
      )}

      {/* Related Concepts */}
      {relatedConcepts.length > 0 && (
        <RelatedConcepts concepts={relatedConcepts} />
      )}

      {/* Sources */}
      {sources.length > 0 && <LearningSources sources={sources} />}

      {/* Continue Learning */}
      {nextLearning.length > 0 && <ContinueLearning topics={nextLearning} />}

      {/* Practice CTA */}
      <PracticeCta topic={questionTitle} />

      {/* Follow-up Questions (Keep learning) */}
      {followUpItems.length > 0 && (
        <FollowUpQuestions questions={followUpItems} onSelect={onAskFollowUp} />
      )}

      {data?.disclaimer && (
        <p className="text-xs text-muted-foreground">{data.disclaimer}</p>
      )}
    </div>
  );
}
