"use client";

import { Flame } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { progressApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

function formatDayLabel(count) {
  return count === 1 ? "day" : "days";
}

export function LearningStreak() {
  const token = useAuthStore((state) => state.token);
  const [streak, setStreak] = useState(null);
  const [hasError, setHasError] = useState(false);

  const loadStreak = useCallback(async () => {
    if (token === null) {
      return;
    }
    setHasError(false);
    try {
      const data = await progressApi.streak(token);
      setStreak(data);
    } catch {
      setHasError(true);
    }
  }, [token]);

  useEffect(() => {
    void loadStreak();
  }, [loadStreak]);

  if (token === null) {
    return null;
  }

  if (streak === null) {
    return (
      <div
        data-testid="learning-streak"
        data-state={hasError ? "error" : "loading"}
        className="flex items-center gap-2 text-sm text-muted-foreground"
        aria-live="polite"
      >
        <Flame
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span>
          {hasError ? "Streak unavailable" : "Checking your streak..."}
        </span>
      </div>
    );
  }

  const current = streak.currentStreak ?? 0;
  const longest = streak.longestStreak ?? 0;
  const isActive = current > 0;

  return (
    <div
      data-testid="learning-streak"
      data-state="ready"
      data-current-streak={current}
      data-longest-streak={longest}
      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
        <Flame
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-orange-500" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        {isActive ? (
          <span>
            {current} {formatDayLabel(current)} streak
          </span>
        ) : (
          <span>0 day streak</span>
        )}
      </span>
      <span className="text-xs text-muted-foreground">
        {streak.totalActiveDays === 0 || (current === 0 && longest === 0)
          ? "Learn a topic to start your streak."
          : `Best: ${longest} ${formatDayLabel(longest)}`}
      </span>
    </div>
  );
}
