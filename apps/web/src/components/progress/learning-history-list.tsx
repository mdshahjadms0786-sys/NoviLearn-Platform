"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

import type { LearningActivity } from "@novilearn/types";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { formatDateTime, truncateTopic } from "@/components/progress/format";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

interface LearningHistoryListProps {
  activities: LearningActivity[];
}

export function LearningHistoryList({ activities }: LearningHistoryListProps) {
  return (
    <DashboardSection
      title="Learning history"
      description="Topics you asked about, from your real learning activity."
    >
      {activities.length === 0 ? (
        <EmptyState
          title="No learning yet"
          description="Head over to Learn and ask your first question to start your history."
          action={
            <Button asChild>
              <Link href="/learn">Start learning</Link>
            </Button>
          }
        />
      ) : (
        <ol className="divide-y">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-center gap-3 py-3">
              <Sparkles
                className="h-5 w-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {truncateTopic(activity.topic, 80)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(activity.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </DashboardSection>
  );
}
