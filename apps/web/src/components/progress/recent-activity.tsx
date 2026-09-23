"use client";

import { Dumbbell, Sparkles } from "lucide-react";

import type { ProgressSummary, RecentActivityItem } from "@novilearn/types";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { formatDateTime, truncateTopic } from "@/components/progress/format";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";

interface RecentActivityProps {
  summary: ProgressSummary;
}

export function RecentActivity({ summary }: RecentActivityProps) {
  const items = summary.recentActivity;

  return (
    <DashboardSection
      title="Recent activity"
      description="Your latest learning and practice, calculated from real data."
    >
      {items.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="When you learn or practice, your recent activity will appear here."
        />
      ) : (
        <ol className="divide-y">
          {items.map((item) => (
            <RecentActivityRow key={`${item.type}-${item.id}`} item={item} />
          ))}
        </ol>
      )}
    </DashboardSection>
  );
}

function RecentActivityRow({ item }: { item: RecentActivityItem }) {
  return (
    <li className="flex items-center gap-3 py-3">
      {item.type === "learn" ? (
        <Sparkles
          className="h-5 w-5 shrink-0 text-primary"
          aria-hidden="true"
        />
      ) : (
        <Dumbbell
          className="h-5 w-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {truncateTopic(item.topic, 80)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(item.at)}
        </p>
      </div>
      <Badge variant="outline">
        {item.type === "learn" ? "Learned" : "Practiced"}
      </Badge>
    </li>
  );
}
