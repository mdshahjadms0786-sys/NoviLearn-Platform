"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { LearningStreak } from "@/components/dashboard/learning-streak";
import { Button } from "@/components/ui/button";
import { progressApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const DAILY_GOAL = 1;

function isToday(dateString, today) {
  const date = new Date(dateString);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function DailyGoalCard() {
  const token = useAuthStore((state) => state.token);
  const [todayCount, setTodayCount] = useState(null);
  const [hasError, setHasError] = useState(false);

  const loadTodayProgress = useCallback(async () => {
    if (token === null) {
      return;
    }

    setHasError(false);
    try {
      const activities = await progressApi.learningHistory(token);
      const today = new Date();
      setTodayCount(
        activities.filter((activity) => isToday(activity.createdAt, today))
          .length,
      );
    } catch {
      setHasError(true);
    }
  }, [token]);

  useEffect(() => {
    void loadTodayProgress();
  }, [loadTodayProgress]);

  const progress = todayCount === null ? 0 : Math.min(todayCount, DAILY_GOAL);
  const isComplete = progress === DAILY_GOAL;

  return (
    <DashboardSection
      title="Today's Learning Goal"
      description="Explore one new topic every day."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-foreground">Learn one topic</p>
            <p className="text-sm text-muted-foreground">
              {todayCount === null
                ? hasError
                  ? "Today's progress is unavailable."
                  : "Checking today's progress..."
                : isComplete
                  ? "Today's goal is complete. Nice work!"
                  : "Ask NoviLearn about a topic to complete your goal."}
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            {todayCount === null ? "— / 1" : `${progress} / 1`}
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Today's learning goal progress"
          aria-valuemin={0}
          aria-valuemax={DAILY_GOAL}
          aria-valuenow={progress}
        >
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${(progress / DAILY_GOAL) * 100}%` }}
          />
        </div>
        <Button asChild size="sm" variant={isComplete ? "outline" : "default"}>
          <Link href="/learn">
            {isComplete ? "Explore another topic" : "Start learning"}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <div className="border-t pt-3">
          <LearningStreak />
        </div>
      </div>
    </DashboardSection>
  );
}
