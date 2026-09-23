"use client";

import Link from "next/link";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { truncateTopic } from "@/components/progress/format";
import { MasteryBadge } from "@/components/progress/mastery-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/states";
export function TopicProgressList({ topics }) {
  return (
    <DashboardSection
      title="Topic progress"
      description="How far you have come on each topic you have learned or practiced."
    >
      {topics.length === 0 ? (
        <EmptyState
          title="No topics tracked yet"
          description="Topics appear here once you ask about them in Learn or complete practice."
          action={
            <Button asChild>
              <Link href="/learn">Start learning</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-4">
          {topics.map((topic) => (
            <li
              key={topic.topic}
              className="rounded-lg border p-4"
              aria-label={`${topic.topic}: ${topic.mastery} mastery, ${topic.progress}% progress`}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-foreground">
                  {truncateTopic(topic.topic, 80)}
                </p>
                <MasteryBadge mastery={topic.mastery} />
              </div>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  {topic.learningCount} learned · {topic.practiceCount}{" "}
                  practiced
                </span>
                <span>{topic.progress}%</span>
              </div>
              <Progress value={topic.progress} aria-hidden="true" />
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}
