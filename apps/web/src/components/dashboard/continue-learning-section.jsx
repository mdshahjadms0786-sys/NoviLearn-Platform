"use client";

import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { progressApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

function formatRelativeTime(isoDate) {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12)
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
}

export function ContinueLearningSection() {
  const token = useAuthStore((state) => state.token);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await progressApi.learningHistory(token, 5);
      setHistory(data);
    } catch (error) {
      console.error("Failed to load learning history", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <DashboardSection
      title="Continue Learning"
      description="Pick up where you left off"
    >
      {isLoading ? (
        <LoadingState message="Loading recent topics..." />
      ) : history.length === 0 ? (
        <EmptyState
          title="No recent topics"
          description="Start exploring new subjects to see them here."
          icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
          action={
            <Button asChild>
              <Link href="/learn">Start Learning</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {history.map((item, index) => (
            <Link
              key={item.id || index}
              href={`/learn?q=${encodeURIComponent(item.topic)}`}
              className="group flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="truncate">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.topic}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(
                      item.createdAt ||
                        item.timestamp ||
                        new Date().toISOString(),
                    )}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
