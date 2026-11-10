"use client";

import { Dumbbell, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { progressApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

function formatRelativeTime(isoDate) {
  if (!isoDate) return "just now";
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

export function RecentActivitySection() {
  const token = useAuthStore((state) => state.token);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadActivity = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await progressApi.summary(token);
      setActivities((data.recentActivity || []).slice(0, 8));
    } catch (error) {
      console.error("Failed to load recent activity", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  return (
    <DashboardSection
      title="Recent Activity"
      description="Your latest learning and practice sessions"
    >
      {isLoading ? (
        <LoadingState message="Loading activity..." />
      ) : activities.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Your activity timeline will appear here once you start learning."
        />
      ) : (
        <div className="relative border-l-2 border-muted ml-3 space-y-4 pb-2">
          {activities.map((activity, index) => {
            const isLearn = activity.type === "learn";
            const Icon = isLearn ? Sparkles : Dumbbell;
            const href = isLearn
              ? `/learn?q=${encodeURIComponent(activity.topic)}`
              : `/practice?topic=${encodeURIComponent(activity.topic)}`;

            return (
              <div key={index} className="relative pl-6">
                <div
                  className={`absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full border bg-background ${
                    isLearn ? "text-blue-500" : "text-green-500"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <Link
                    href={href}
                    className="text-sm font-medium hover:underline text-foreground"
                  >
                    {isLearn ? "Learned " : "Practiced "}
                    <span className="font-semibold">{activity.topic}</span>
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(
                      activity.createdAt || activity.timestamp,
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}
