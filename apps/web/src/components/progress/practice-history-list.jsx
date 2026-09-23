"use client";

import { Dumbbell } from "lucide-react";
import Link from "next/link";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { formatDateTime, truncateTopic } from "@/components/progress/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
export function PracticeHistoryList({ sessions, onOpenSession }) {
  return (
    <DashboardSection
      title="Practice history"
      description="Your completed practice sessions, with topics and scores."
    >
      {sessions.length === 0 ? (
        <EmptyState
          title="No practice yet"
          description="Complete your first practice session to see your results here."
          action={
            <Button asChild>
              <Link href="/practice">Start practicing</Link>
            </Button>
          }
        />
      ) : (
        <ol className="divide-y">
          {sessions.map((session) => (
            <li key={session.id} className="flex items-center gap-3 py-3">
              <Dumbbell
                className="h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onOpenSession(session)}
                  className="block w-full truncate text-left text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  aria-label={`View details for ${session.topic}`}
                >
                  {truncateTopic(session.topic, 80)}
                </button>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(session.completedAt)}
                </p>
              </div>
              <Badge variant={session.accuracy >= 80 ? "success" : "outline"}>
                {session.score}/{session.totalQuestions} · {session.accuracy}%
              </Badge>
            </li>
          ))}
        </ol>
      )}
    </DashboardSection>
  );
}
