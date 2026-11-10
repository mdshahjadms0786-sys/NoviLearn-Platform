"use client";

import { Flame } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function StreakStats({ streak }) {
  if (!streak) return null;

  const isActive = streak.currentStreak > 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="flex items-center text-4xl font-bold">
              {streak.currentStreak}
              <Flame
                className={`ml-2 h-8 w-8 ${
                  isActive ? "text-orange-500" : "text-muted-foreground"
                }`}
                fill={isActive ? "currentColor" : "none"}
              />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Current Streak
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="text-4xl font-bold">{streak.longestStreak}</div>
            <p className="text-sm font-medium text-muted-foreground">
              Longest Streak
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="text-4xl font-bold">{streak.activeDays}</div>
            <p className="text-sm font-medium text-muted-foreground">
              Active Days
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="text-xl font-bold">
              {streak.lastActiveDate
                ? new Date(streak.lastActiveDate).toLocaleDateString()
                : "None"}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Last Active Date
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
