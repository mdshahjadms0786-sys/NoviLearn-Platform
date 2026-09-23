"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
function ProgressStat({ label, value }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
export function ProgressStats({ summary }) {
  const stats = [
    {
      label: "Learning activities",
      value: String(summary.learningActivityCount),
    },
    {
      label: "Practice sessions",
      value: String(summary.practiceSessionCount),
    },
    {
      label: "Topics tracked",
      value: String(summary.uniqueTopicCount),
    },
    {
      label: "Average accuracy",
      value:
        summary.averageAccuracy === null ? "—" : `${summary.averageAccuracy}%`,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <ProgressStat key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}
export function EmptyProgressStats({ action }) {
  return (
    <Card>
      <CardContent>
        <EmptyState
          title="No progress yet"
          description="Statistics on this page are calculated only from your real learning and practice activity."
          action={action}
        />
      </CardContent>
    </Card>
  );
}
