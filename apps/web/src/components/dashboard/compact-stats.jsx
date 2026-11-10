"use client";

import { BookOpen, Dumbbell, Flame, Target } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { progressApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export function CompactStats() {
  const token = useAuthStore((state) => state.token);
  const [summary, setSummary] = useState(null);
  const [streak, setStreak] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const [summaryData, streakData] = await Promise.all([
        progressApi.summary(token),
        progressApi.streak(token),
      ]);
      setSummary(summaryData);
      setStreak(streakData);
    } catch (error) {
      console.error("Failed to load compact stats", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const stats = [
    {
      label: "Topics Explored",
      value: summary?.totalTopicsExplored ?? 0,
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Practice Sessions",
      value: summary?.totalPracticeSessions ?? 0,
      icon: Dumbbell,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Avg Accuracy",
      value: summary?.averageAccuracy
        ? `${Math.round(summary.averageAccuracy * 100)}%`
        : "0%",
      icon: Target,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Active Streak",
      value: streak?.currentStreak ?? 0,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                {isLoading ? (
                  <div className="mt-1 h-8 w-12 bg-muted rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
