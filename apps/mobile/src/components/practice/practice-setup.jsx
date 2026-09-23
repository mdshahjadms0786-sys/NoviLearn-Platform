"use client";

import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../theme-provider";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
const DIFFICULTIES = [
  {
    value: "easy",
    label: "Easy",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "hard",
    label: "Hard",
  },
];
const QUESTION_TYPES = [
  {
    value: "mixed",
    label: "Mixed",
  },
  {
    value: "mcq",
    label: "MCQ",
  },
  {
    value: "true_false",
    label: "True/False",
  },
  {
    value: "short_answer",
    label: "Short Answer",
  },
];
function ChoiceChip({ label, selected, onPress }) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected,
      }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
          backgroundColor: selected
            ? theme.colors.primary
            : theme.colors.surface,
        },
        pressed && styles.chipPressed,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: selected ? theme.colors.onPrimary : theme.colors.onSurface,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
function ChoiceGroup({ label, options, selectedValue, onSelect }) {
  const { theme } = useTheme();
  return (
    <View style={styles.group}>
      <Text
        style={[
          styles.groupLabel,
          {
            color: theme.colors.onSurface,
          },
        ]}
      >
        {label}
      </Text>
      <View style={styles.chipRow}>
        {options.map((option) => (
          <ChoiceChip
            key={option.value}
            label={option.label}
            selected={selectedValue === option.value}
            onPress={() => onSelect(option.value)}
          />
        ))}
      </View>
    </View>
  );
}
export function PracticeSetup({ initialTopic, onSubmit }) {
  const { theme } = useTheme();
  const [topic, setTopic] = React.useState(initialTopic ?? "");
  const [questionCount, setQuestionCount] = React.useState(5);
  const [difficulty, setDifficulty] = React.useState("medium");
  const [questionType, setQuestionType] = React.useState("mixed");
  const canSubmit = topic.trim().length >= 2;
  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }
    onSubmit({
      topic: topic.trim(),
      questionCount,
      difficulty,
      questionType,
    });
  };
  return (
    <Card>
      <CardHeader
        title="Start practicing"
        subtitle="Pick a topic and a few options. NoviLearn will create questions for you."
      />
      <CardContent style={styles.content}>
        <Input
          label="What do you want to practice?"
          value={topic}
          onChangeText={setTopic}
          placeholder="e.g. JavaScript Functions"
          autoCorrect={false}
          autoCapitalize="sentences"
          returnKeyType="done"
        />

        <ChoiceGroup
          label="Question count"
          options={[5, 10].map((count) => ({
            value: String(count),
            label: String(count),
          }))}
          selectedValue={String(questionCount)}
          onSelect={(value) => setQuestionCount(value === "10" ? 10 : 5)}
        />

        <ChoiceGroup
          label="Difficulty"
          options={DIFFICULTIES}
          selectedValue={difficulty}
          onSelect={(value) => setDifficulty(value)}
        />

        <ChoiceGroup
          label="Question type"
          options={QUESTION_TYPES}
          selectedValue={questionType}
          onSelect={(value) => setQuestionType(value)}
        />

        <Button
          fullWidth
          disabled={!canSubmit}
          icon={
            <Ionicons name="play" size={16} color={theme.colors.onPrimary} />
          }
          onPress={handleSubmit}
        >
          Start Practice
        </Button>
      </CardContent>
    </Card>
  );
}
const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  group: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
});
