"use client";

import Link from "next/link";
import * as React from "react";

import { DailyGoalHistory } from "@/components/progress/daily-goal-history";
import { EnhancedStats } from "@/components/progress/enhanced-stats";
import { LearningHistoryList } from "@/components/progress/learning-history-list";
import { NextLearning } from "@/components/progress/next-learning";
import { PracticeHistoryList } from "@/components/progress/practice-history-list";
import { PracticeSessionDetailView } from "@/components/progress/practice-session-detail";
import { EmptyProgressStats } from "@/components/progress/progress-stats";
import { RecentActivity } from "@/components/progress/recent-activity";
import { StreakStats } from "@/components/progress/streak-stats";
import { TopicProgressList } from "@/components/progress/topic-progress-list";
import { WeakTopicsSection } from "@/components/progress/weak-topics-section";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApiClientError, progressApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export function ProgressOverview() {
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");

  const [data, setData] = React.useState({
    summary: null,
    streak: null,
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
    if (!token) return;

    setLoading(true);
    setErrorMessage("");
    setSelectedSession(null);
    setDetail(null);
    setDetailError("");

    try {
      const [
        summary,
        streak,
        topics,
        suggestions,
        learningActivities,
        practiceSessions,
      ] = await Promise.all([
        progressApi.summary(token),
        progressApi.streak(token),
        progressApi.topics(token),
        progressApi.suggestions(token),
        progressApi.learningHistory(token, 30),
        progressApi.practiceHistory(token, 30),
      ]);

      setData({
        summary,
        streak,
        topics,
        suggestions,
        learningActivities,
        practiceSessions,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.error.message
          : "We could not load your progress data right now.",
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
      if (!token) return;
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
    return <LoadingState message="Loading your comprehensive progress..." />;
  }

  if (errorMessage !== "" || !data.summary) {
    return (
      <ErrorState
        title="Could not load progress overview"
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
        onBack={() => {
          setSelectedSession(null);
        }}
        onRetry={retryDetail}
      />
    );
  }

  const hasAnyActivity =
    data.summary.learningActivityCount > 0 ||
    data.summary.practiceSessionCount > 0;

  if (!hasAnyActivity) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Progress Overview
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your learning journey, calculated from real activity only.
          </p>
        </div>
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
      </div>
    );
  }

  const weakTopics = data.topics.filter(
    (t) => t.averageAccuracy < 60 && t.practiceCount >= 2,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress Overview</h1>
        <p className="mt-2 text-muted-foreground">
          Track your learning journey, streak, and recent activity.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EnhancedStats summary={data.summary} streak={data.streak} />
          <StreakStats streak={data.streak} />
          <DailyGoalHistory learningHistory={data.learningActivities} />

          {weakTopics.length > 0 && <WeakTopicsSection topics={data.topics} />}

          <RecentActivity summary={data.summary} />
          <NextLearning suggestions={data.suggestions} />
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <TopicProgressList topics={data.topics} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <LearningHistoryList activities={data.learningActivities} />
          <PracticeHistoryList
            sessions={data.practiceSessions}
            onOpenSession={(session) => void openSession(session)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
