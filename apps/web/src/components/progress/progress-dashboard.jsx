"use client";

import Link from "next/link";
import * as React from "react";

import { LearningHistoryList } from "@/components/progress/learning-history-list";
import { NextLearning } from "@/components/progress/next-learning";
import { PracticeHistoryList } from "@/components/progress/practice-history-list";
import { PracticeSessionDetailView } from "@/components/progress/practice-session-detail";
import {
  EmptyProgressStats,
  ProgressStats,
} from "@/components/progress/progress-stats";
import { RecentActivity } from "@/components/progress/recent-activity";
import { TopicProgressList } from "@/components/progress/topic-progress-list";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { ApiClientError, progressApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
export function ProgressDashboard() {
  const token = useAuthStore((s) => s.token);
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
    return <LoadingState message="Loading your progress..." />;
  }
  if (errorMessage !== "" || data.summary === null) {
    return (
      <ErrorState
        title="We could not load your progress"
        description={errorMessage}
        action={<Button onClick={() => void load()}>Try again</Button>}
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="mt-2 text-muted-foreground">
          Your learning journey, calculated from real activity only.
        </p>
      </div>

      {hasAnyActivity ? (
        <ProgressStats summary={data.summary} />
      ) : (
        <EmptyProgressStats
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/learn">Start learning</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/practice">Start practicing</Link>
              </Button>
            </div>
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
    </div>
  );
}
