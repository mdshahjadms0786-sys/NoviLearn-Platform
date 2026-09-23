"use client";

import { StyleSheet, View } from "react-native";

import type { LearningResponse } from "@novilearn/types";

import { ContinueLearning } from "./continue-learning";
import { FollowUpQuestions } from "./follow-up-questions";
import { LearningSection } from "./learning-section";
import { LearningSources } from "./learning-sources";
import { MarkdownText } from "./markdown";
import { PracticeCta } from "./practice-cta";
import { RelatedConcepts } from "./related-concepts";
import { VisualLearning } from "./visual-learning";
import { useTheme } from "../../theme-provider";

interface LearningExperienceProps {
  response: LearningResponse;
  onAskFollowUp: (question: string) => void;
}

export function LearningExperience({
  response,
  onAskFollowUp,
}: LearningExperienceProps) {
  const { theme } = useTheme();
  const followUpSection = response.sections.find(
    (section) => section.type === "follow_ups",
  );
  const contentSections = response.sections.filter(
    (section) => section.type !== "follow_ups",
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.questionBanner,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <MarkdownText text={response.question} style={styles.questionText} />
      </View>

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

      {response.sources !== undefined && response.sources.length > 0 && (
        <LearningSources sources={response.sources} />
      )}

      {response.nextLearning !== undefined &&
        response.nextLearning.length > 0 && (
          <ContinueLearning topics={response.nextLearning} />
        )}

      <PracticeCta topic={response.question} />

      {followUpSection !== undefined &&
        followUpSection.items !== undefined &&
        followUpSection.items.length > 0 && (
          <FollowUpQuestions
            questions={followUpSection.items}
            onSelect={onAskFollowUp}
          />
        )}

      {response.disclaimer !== undefined && (
        <View>
          <MarkdownText
            text={response.disclaimer}
            style={styles.disclaimerText}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  questionBanner: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
