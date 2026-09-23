"use client";

import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

import { LearningExperience } from "./learning-experience";
import { QuestionForm } from "./question-form";
import { ApiClientError, aiApi } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";
import { useTheme } from "../../theme-provider";
import { Button } from "../ui/button";
import { EmptyState, ErrorState, LoadingState } from "../ui/states";
const LOADING_STAGES = [
  "Understanding your question...",
  "Preparing your explanation...",
];
export function AiTutor({ initialQuestion }) {
  const token = useAuthStore((s) => s.token);
  const { theme } = useTheme();
  const [question, setQuestion] = React.useState(initialQuestion ?? "");
  const [status, setStatus] = React.useState("idle");
  const [response, setResponse] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [lastQuestion, setLastQuestion] = React.useState("");
  const [loadingStage, setLoadingStage] = React.useState(0);
  const canSubmit = question.trim().length >= 2 && status !== "loading";
  React.useEffect(() => {
    if (status !== "loading") {
      return;
    }
    setLoadingStage(0);
    const interval = setInterval(() => {
      setLoadingStage((stage) =>
        Math.min(stage + 1, LOADING_STAGES.length - 1),
      );
    }, 2500);
    return () => clearInterval(interval);
  }, [status]);
  const submit = async (value) => {
    if (status === "loading" || token === null) {
      return;
    }
    const questionToAsk = value.trim();
    if (questionToAsk === "") {
      return;
    }
    setStatus("loading");
    setErrorMessage("");
    setLastQuestion(questionToAsk);
    setResponse(null);
    try {
      const result = await aiApi.learn(token, {
        question: questionToAsk,
      });
      setResponse(result);
      setStatus("success");
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.error.message
          : "We could not process your question right now.";
      setErrorMessage(message);
      setStatus("error");
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.onBackground,
            },
          ]}
        >
          Learn
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.onSurfaceVariant,
            },
          ]}
        >
          Ask NoviLearn anything and get a clear, structured lesson.
        </Text>
      </View>

      <QuestionForm
        headerTitle="What do you want to learn today?"
        headerSubtitle="Ask a question and NoviLearn will explain it step by step."
        fieldLabel="Your learning question"
        placeholder="e.g. Explain Newton's First Law in simple language"
        buttonLabel="Ask NoviLearn"
        question={question}
        onChangeText={setQuestion}
        onSubmit={() => void submit(question)}
        disabled={status === "loading"}
        canSubmit={canSubmit}
        loading={status === "loading"}
      />

      {status === "idle" && (
        <EmptyState
          icon={
            <Ionicons
              name="sparkles-outline"
              size={28}
              color={theme.colors.onSurfaceVariant}
            />
          }
          title="Ready when you are"
          description="Type a question above to get a structured lesson with key concepts, examples, and next steps."
        />
      )}

      {status === "loading" && (
        <LoadingState
          message={
            LOADING_STAGES[loadingStage] ?? "Understanding your question..."
          }
        />
      )}

      {status === "error" && (
        <ErrorState
          title="Something went wrong while preparing your lesson"
          description={errorMessage}
          action={
            <Button
              variant="outlined"
              onPress={() => void submit(lastQuestion)}
              disabled={lastQuestion === ""}
            >
              Try again
            </Button>
          }
        />
      )}

      {status === "success" && response !== null && (
        <>
          <LearningExperience
            response={response}
            onAskFollowUp={(questionToAsk) => {
              setQuestion(questionToAsk);
              void submit(questionToAsk);
            }}
          />
          <QuestionForm
            headerTitle="Ask another question"
            headerSubtitle="Keep exploring a new concept with NoviLearn."
            fieldLabel="Your next learning question"
            placeholder="Type your next question"
            buttonLabel="Ask NoviLearn"
            question={question}
            onChangeText={setQuestion}
            onSubmit={() => void submit(question)}
            disabled={false}
            canSubmit={canSubmit}
            loading={false}
          />
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "System",
  },
});
