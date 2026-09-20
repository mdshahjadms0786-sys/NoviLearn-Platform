"use client";

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { PracticeQuestion, PracticeResult } from "@novilearn/types";

import { useTheme } from "../../theme-provider";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";

const SUCCESS_GREEN = "#22c55e";

interface StatProps {
  label: string;
  value: string;
}

function Stat({ label, value }: StatProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.stat, { backgroundColor: theme.colors.surfaceVariant }]}
    >
      <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
        {value}
      </Text>
      <Text
        style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
      >
        {label}
      </Text>
    </View>
  );
}

interface PracticeResultViewProps {
  result: PracticeResult;
  questions: PracticeQuestion[];
  onPracticeAgain: () => void;
  onLearnTopic: () => void;
}

export function PracticeResultView({
  result,
  questions,
  onPracticeAgain,
  onLearnTopic,
}: PracticeResultViewProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Card>
        <CardHeader
          title="Practice Complete"
          subtitle={`Topic · ${result.topic}`}
          style={styles.header}
        />
        <CardContent style={styles.content}>
          <View style={styles.scoreRow}>
            <Text style={[styles.score, { color: theme.colors.onSurface }]}>
              {result.score}
            </Text>
            <Text
              style={[
                styles.scoreTotal,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              / {result.totalQuestions}
            </Text>
          </View>
          <View style={styles.stats}>
            <Stat label="Correct" value={String(result.correctAnswers)} />
            <Stat label="Incorrect" value={String(result.incorrectAnswers)} />
            <Stat label="Accuracy" value={`${result.accuracy}%`} />
          </View>
          <Button fullWidth onPress={onPracticeAgain}>
            Practice Again
          </Button>
          <Button fullWidth variant="outlined" onPress={onLearnTopic}>
            Learn This Topic
          </Button>
        </CardContent>
      </Card>

      <View style={styles.breakdownHeader}>
        <Text
          style={[styles.breakdownTitle, { color: theme.colors.onBackground }]}
        >
          Question breakdown
        </Text>
      </View>
      {result.results.map((entry, index) => {
        const question = questions.find(
          (candidate) => candidate.id === entry.questionId,
        );
        return (
          <Card key={entry.questionId}>
            <CardContent style={styles.breakdownRow}>
              <Ionicons
                name={entry.correct ? "checkmark-circle" : "close-circle"}
                size={20}
                color={entry.correct ? SUCCESS_GREEN : theme.colors.error}
              />
              <View style={styles.breakdownText}>
                <Text
                  style={[
                    styles.breakdownQuestion,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {index + 1}. {question?.question ?? entry.correctAnswer}
                </Text>
                <Text
                  style={[
                    styles.breakdownDetail,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Correct answer: {entry.correctAnswer}
                  {!entry.correct ? ` · Your answer: ${entry.answer}` : ""}
                </Text>
              </View>
            </CardContent>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    paddingBottom: 12,
  },
  content: {
    gap: 16,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 4,
  },
  score: {
    fontSize: 56,
    fontWeight: "700",
    fontFamily: "System",
  },
  scoreTotal: {
    fontSize: 24,
    fontFamily: "System",
  },
  stats: {
    flexDirection: "row",
    gap: 10,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 12,
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "System",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "System",
  },
  breakdownHeader: {
    marginTop: 4,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "System",
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  breakdownText: {
    flex: 1,
    gap: 2,
  },
  breakdownQuestion: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
    lineHeight: 19,
  },
  breakdownDetail: {
    fontSize: 13,
    fontFamily: "System",
    lineHeight: 18,
  },
});
