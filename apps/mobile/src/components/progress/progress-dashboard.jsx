"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

import { LearningHistoryList } from "./learning-history-list";
import { NextLearning } from "./next-learning";
import { PracticeHistoryList } from "./practice-history-list";
import { PracticeSessionDetailView } from "./practice-session-detail";
import { EmptyProgressStats, ProgressStats } from "./progress-stats";
import { RecentActivity } from "./recent-activity";
import { TopicProgressList } from "./topic-progress-list";
import { ApiClientError, progressApi } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";
import { useTheme } from "../../theme-provider";
import { DashboardEmpty } from "../dashboard/dashboard-empty";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
export function ProgressDashboard() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [data, setData] = React.useState({
    summary: null,
    learningActivities: [],
    practiceSessions: [],
    topics: [],
    suggestions: [],
  });
  const [selectedSession, setSelectedSession] = React.useState(null);
  const [detail, setDetail] = React.useState(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState("");
  const load = React.useCallback(async () => {
    if (token === null) {
      return;
    }
    setLoading(true);
    setErrorMessage("");
    setSelectedSession(null);
    setDetail(null);
    setDetailError("");
    try {
      const [
        summary,
        learningActivities,
        practiceSessions,
        topics,
        suggestions,
      ] = await Promise.all([
        progressApi.summary(token),
        progressApi.learningHistory(token),
        progressApi.practiceHistory(token),
        progressApi.topics(token),
        progressApi.suggestions(token),
      ]);
      setData({
        summary,
        learningActivities,
        practiceSessions,
        topics,
        suggestions,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.error.message
          : "We could not load your progress right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);
  React.useEffect(() => {
    void load();
  }, [load]);
  const openSession = React.useCallback(
    async (session) => {
      if (token === null) {
        return;
      }
      setSelectedSession(session);
      setDetail(null);
      setDetailError("");
      setDetailLoading(true);
      try {
        const loaded = await progressApi.practiceDetail(token, session.id);
        setDetail(loaded);
      } catch (error) {
        setDetailError(
          error instanceof ApiClientError
            ? error.error.message
            : "We could not load the details of this session.",
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [token],
  );
  const retryDetail = React.useCallback(() => {
    if (selectedSession !== null) {
      void openSession(selectedSession);
    }
  }, [selectedSession, openSession]);
  if (loading) {
    return <Spinner size="lg" />;
  }
  if (errorMessage !== "" || data.summary === null) {
    return (
      <DashboardEmpty
        icon={
          <Ionicons
            name="alert-circle-outline"
            size={24}
            color={theme.colors.error}
          />
        }
        title="We could not load your progress"
        description={errorMessage}
        action={<Button onPress={() => void load()}>Try again</Button>}
      />
    );
  }
  if (selectedSession !== null) {
    return (
      <PracticeSessionDetailView
        detail={detail}
        loading={detailLoading}
        error={detailError}
        onBack={() => void load()}
        onRetry={retryDetail}
      />
    );
  }
  const hasAnyActivity =
    data.summary.learningActivityCount > 0 ||
    data.summary.practiceSessionCount > 0;
  return (
    <View style={styles.root}>
      <View style={styles.headerBlock}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.onSurface,
            },
          ]}
        >
          Progress
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            {
              color: theme.colors.onSurfaceVariant,
            },
          ]}
        >
          Your learning journey, calculated from real activity only.
        </Text>
      </View>

      {hasAnyActivity ? (
        <ProgressStats summary={data.summary} />
      ) : (
        <EmptyProgressStats
          action={
            <View style={styles.actionsRow}>
              <Button onPress={() => router.push("/learn")}>
                Start learning
              </Button>
              <Button
                variant="outlined"
                onPress={() => router.push("/practice")}
              >
                Start practicing
              </Button>
            </View>
          }
        />
      )}

      <RecentActivity summary={data.summary} />
      <NextLearning suggestions={data.suggestions} />
      <TopicProgressList topics={data.topics} />
      <LearningHistoryList activities={data.learningActivities} />
      <PracticeHistoryList
        sessions={data.practiceSessions}
        onOpenSession={(session) => void openSession(session)}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  headerBlock: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "System",
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "System",
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
});
