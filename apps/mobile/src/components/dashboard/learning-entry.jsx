"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { StyleSheet } from "react-native";

import { useTheme } from "../../theme-provider";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
export function LearningEntry() {
  const router = useRouter();
  const { theme } = useTheme();
  const [query, setQuery] = React.useState("");
  const canSubmit = query.trim() !== "";
  const handleSubmit = () => {
    if (canSubmit) {
      router.push(`/learn?q=${encodeURIComponent(query.trim())}`);
    }
  };
  return (
    <Card>
      <CardHeader
        title="What do you want to learn today?"
        subtitle="Ask NoviLearn and get a structured explanation."
      />
      <CardContent style={styles.content}>
        <Input
          label="Topic"
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. Introduction to Python"
          autoCorrect={false}
          returnKeyType="send"
          onSubmitEditing={() => handleSubmit()}
        />
        <Button
          fullWidth
          disabled={!canSubmit}
          icon={
            <Ionicons
              name="sparkles"
              size={16}
              color={theme.colors.onPrimary}
            />
          }
          onPress={() => handleSubmit()}
        >
          Ask NoviLearn
        </Button>
      </CardContent>
    </Card>
  );
}
const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
});
