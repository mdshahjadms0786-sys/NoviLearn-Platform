import { StyleSheet, Text, View } from "react-native";

import { truncateTopic } from "./format";
import { useTheme } from "../../theme-provider";
import { DashboardEmpty } from "../dashboard/dashboard-empty";
import { DashboardSection } from "../dashboard/dashboard-section";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
const QUESTION_TYPE_LABELS = {
  boolean: "True or False",
  multiple_choice: "Multiple choice",
  short_answer: "Short answer",
};
export function PracticeSessionDetailView({
  detail,
  loading,
  error,
  onBack,
  onRetry,
}) {
  const { theme } = useTheme();
  if (loading) {
    return <Spinner size="lg" />;
  }
  if (detail === null || error !== "") {
    return (
      <DashboardEmpty
        title="Could not load this practice session"
        description={error || "Please try again."}
        action={
          <View style={styles.actionsRow}>
            <Button onPress={onRetry}>Try again</Button>
            <Button variant="outlined" onPress={onBack}>
              Back to progress
            </Button>
          </View>
        }
      />
    );
  }
  const stats = [
    {
      label: "Score",
      value: `${detail.score}`,
    },
    {
      label: "Accuracy",
      value: `${detail.accuracy}%`,
    },
    {
      label: "Correct",
      value: `${detail.correctAnswers}`,
    },
    {
      label: "Incorrect",
      value: `${detail.incorrectAnswers}`,
    },
    {
      label: "Questions",
      value: `${detail.totalQuestions}`,
    },
    {
      label: "Question type",
      value: `${detail.questionType}`,
    },
  ];
  return (
    <View style={styles.root}>
      <View style={styles.backRow}>
        <Button variant="text" onPress={onBack}>
          Back to progress
        </Button>
      </View>

      <View style={styles.headerBlock}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.onSurface,
            },
          ]}
        >
          Practice details
        </Text>
        <Text
          style={[
            styles.headerMeta,
            {
              color: theme.colors.onSurfaceVariant,
            },
          ]}
        >
          {truncateTopic(detail.topic, 80)} · {detail.difficulty} ·{" "}
          {QUESTION_TYPE_LABELS[detail.questionType] ?? detail.questionType}
        </Text>
      </View>

      <View style={styles.grid}>
        {stats.map((stat) => (
          <View
            key={stat.label}
            style={[
              styles.stat,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
              },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                {
                  color: theme.colors.onSurface,
                },
              ]}
            >
              {stat.value}
            </Text>
            <Text
              style={[
                styles.statLabel,
                {
                  color: theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <DashboardSection
        title="Question breakdown"
        description="Your answers, in order."
      >
        {detail.results.length === 0 ? (
          <DashboardEmpty
            title="No question details"
            description="No question details were recorded for this session."
          />
        ) : (
          <View style={styles.list}>
            {detail.results.map((entry, index) => (
              <View
                key={entry.questionId}
                style={[
                  styles.question,
                  {
                    borderColor: theme.colors.outline,
                  },
                ]}
              >
                <View style={styles.questionHeader}>
                  <Text
                    style={[
                      styles.questionText,
                      {
                        color: theme.colors.onSurface,
                      },
                    ]}
                  >
                    {index + 1}. {entry.question}
                  </Text>
                  <Badge
                    variant={entry.correct ? "success" : "error"}
                    size="sm"
                  >
                    {entry.correct ? "Correct" : "Incorrect"}
                  </Badge>
                </View>
                <Text
                  style={[
                    styles.answerText,
                    {
                      color: theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  Correct answer: {entry.correctAnswer}
                  {!entry.correct ? ` · Your answer: ${entry.answer}` : ""}
                </Text>
                {entry.explanation !== "" ? (
                  <Text
                    style={[
                      styles.answerText,
                      {
                        color: theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {entry.explanation}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </DashboardSection>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  backRow: {
    alignItems: "flex-start",
  },
  headerBlock: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "System",
  },
  headerMeta: {
    fontSize: 13,
    fontFamily: "System",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  stat: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "System",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "System",
  },
  list: {
    gap: 12,
  },
  question: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
  },
  answerText: {
    fontSize: 12,
    fontFamily: "System",
    lineHeight: 16,
  },
});
