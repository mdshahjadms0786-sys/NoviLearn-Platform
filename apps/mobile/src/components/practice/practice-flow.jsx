"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PracticeFeedbackView } from "./practice-feedback";
import { PracticeQuestionView } from "./practice-question";
import { PracticeResultView } from "./practice-result";
import { PracticeSetup } from "./practice-setup";
import { ApiClientError, practiceApi } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";
import { useTheme } from "../../theme-provider";
import { Button } from "../ui/button";
import { ErrorState, LoadingState } from "../ui/states";
const LOADING_STAGES = ["Preparing your practice...", "Creating questions..."];
const ERROR_TITLES = {
  generate: "Something went wrong while preparing your practice",
  answer: "Something went wrong while evaluating your answer",
  complete: "Something went wrong while finishing your practice",
};
export function PracticeFlow({ initialTopic }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { theme } = useTheme();
  const [status, setStatus] = React.useState("setup");
  const [setupTopic, setSetupTopic] = React.useState(initialTopic ?? "");
  const [loadingStage, setLoadingStage] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [pendingAction, setPendingAction] = React.useState("generate");
  const [practiceSet, setPracticeSet] = React.useState(null);
  const [index, setIndex] = React.useState(0);
  const [answerValue, setAnswerValue] = React.useState("");
  const [feedback, setFeedback] = React.useState(null);
  const [evaluating, setEvaluating] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [lastConfig, setLastConfig] = React.useState(null);
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
  const handleStart = async (config) => {
    if (token === null) {
      return;
    }
    setLastConfig(config);
    setPendingAction("generate");
    setErrorMessage("");
    setStatus("loading");
    setPracticeSet(null);
    try {
      const generated = await practiceApi.generate(token, config);
      setPracticeSet(generated);
      setIndex(0);
      setAnswerValue("");
      setFeedback(null);
      setResult(null);
      setStatus("ready");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.error.message
          : "We could not prepare your practice right now.",
      );
      setStatus("error");
    }
  };
  const submitAnswer = async () => {
    if (token === null || practiceSet === null || evaluating || completing) {
      return;
    }
    const question = practiceSet.questions[index];
    if (question === undefined || answerValue.trim() === "") {
      return;
    }
    setPendingAction("answer");
    setErrorMessage("");
    setEvaluating(true);
    try {
      const evaluation = await practiceApi.answer(token, {
        sessionId: practiceSet.sessionId,
        questionId: question.id,
        answer: answerValue.trim(),
      });
      setFeedback(evaluation);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.error.message
          : "We could not evaluate your answer right now.",
      );
      setPendingAction("answer");
      setStatus("error");
    } finally {
      setEvaluating(false);
    }
  };
  const handleNext = async () => {
    if (token === null || practiceSet === null || completing) {
      return;
    }
    const isLast = index === practiceSet.questions.length - 1;
    if (!isLast) {
      setIndex((current) => current + 1);
      setAnswerValue("");
      setFeedback(null);
      return;
    }
    setPendingAction("complete");
    setErrorMessage("");
    setCompleting(true);
    try {
      const completed = await practiceApi.complete(
        token,
        practiceSet.sessionId,
      );
      setResult(completed);
      setStatus("complete");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.error.message
          : "We could not finish your practice right now.",
      );
      setPendingAction("complete");
      setStatus("error");
    } finally {
      setCompleting(false);
    }
  };
  const restart = (topic) => {
    setSetupTopic(topic ?? "");
    setStatus("setup");
    setPracticeSet(null);
    setIndex(0);
    setAnswerValue("");
    setFeedback(null);
    setResult(null);
    setErrorMessage("");
  };
  const handleRetry = () => {
    if (pendingAction === "generate") {
      if (lastConfig !== null) {
        void handleStart(lastConfig);
      }
      return;
    }
    if (pendingAction === "answer") {
      void submitAnswer();
      return;
    }
    void handleNext();
  };
  const handleLearnTopic = () => {
    if (practiceSet !== null) {
      router.push(`/learn?q=${encodeURIComponent(practiceSet.topic)}`);
    }
  };
  const question = practiceSet?.questions[index];
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
          Practice
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.onSurfaceVariant,
            },
          ]}
        >
          Test your understanding with interactive questions.
        </Text>
      </View>

      {status === "setup" && (
        <PracticeSetup
          key={setupTopic}
          initialTopic={setupTopic}
          onSubmit={(config) => void handleStart(config)}
        />
      )}

      {status === "loading" && (
        <LoadingState
          message={LOADING_STAGES[loadingStage] ?? "Preparing your practice..."}
        />
      )}

      {status === "error" && (
        <ErrorState
          title={ERROR_TITLES[pendingAction]}
          description={errorMessage}
          action={
            <View style={styles.errorActions}>
              <Button variant="outlined" onPress={handleRetry}>
                Try Again
              </Button>
              <Button variant="outlined" onPress={() => restart(setupTopic)}>
                Back to Practice
              </Button>
            </View>
          }
        />
      )}

      {status === "ready" &&
        practiceSet !== null &&
        question !== undefined &&
        (feedback === null ? (
          <PracticeQuestionView
            topic={practiceSet.topic}
            question={question}
            index={index}
            total={practiceSet.questions.length}
            value={answerValue}
            onAnswerChange={setAnswerValue}
            onSubmit={() => void submitAnswer()}
            submitting={evaluating}
            disabled={completing}
          />
        ) : (
          <PracticeFeedbackView
            correct={feedback.correct}
            explanation={feedback.explanation}
            correctAnswer={feedback.correctAnswer}
            isLast={index === practiceSet.questions.length - 1}
            onNext={() => void handleNext()}
            loading={completing}
          />
        ))}

      {status === "complete" && result !== null && practiceSet !== null && (
        <PracticeResultView
          result={result}
          questions={practiceSet.questions}
          onPracticeAgain={() => restart(result.topic)}
          onLearnTopic={handleLearnTopic}
        />
      )}

      {status === "complete" && result === null && (
        <View style={styles.emptyFallback}>
          <Ionicons
            name="fitness-outline"
            size={28}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
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
  errorActions: {
    gap: 8,
  },
  emptyFallback: {
    alignItems: "center",
  },
});
