"use client";

import { useMemo } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function DailyGoalHistory({ learningHistory }) {
  const { last7Days, totalThisWeek } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        count: 0,
      };
    });

    let total = 0;

    learningHistory.forEach((activity) => {
      const activityDate = new Date(activity.createdAt);
      activityDate.setHours(0, 0, 0, 0);

      const dayIndex = days.findIndex(
        (d) => d.date.getTime() === activityDate.getTime(),
      );

      if (dayIndex !== -1) {
        days[dayIndex].count++;
        total++;
      }
    });

    return { last7Days: days, totalThisWeek: total };
  }, [learningHistory]);

  const getColorClass = (count) => {
    if (count === 0) return "bg-muted";
    if (count === 1) return "bg-green-200 dark:bg-green-900/40";
    if (count === 2) return "bg-green-400 dark:bg-green-700/60";
    if (count >= 3) return "bg-green-600 dark:bg-green-500/80";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Learning Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {last7Days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className={`h-12 w-full rounded-md ${getColorClass(day.count)}`}
                title={`${day.count} activities`}
              />
              <span className="text-xs text-muted-foreground">{day.label}</span>
              <span className="text-xs font-semibold">{day.count}</span>
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t">
          Total topics learned this week:{" "}
          <span className="font-bold text-foreground">{totalThisWeek}</span>
        </div>
      </CardContent>
    </Card>
  );
}
