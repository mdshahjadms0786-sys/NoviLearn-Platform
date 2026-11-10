"use client";

import {
  BookOpen,
  Target,
  Layers,
  Percent,
  HelpCircle,
  Flame,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EnhancedStats({ summary, streak }) {
  if (!summary) return null;

  const getAccuracyColor = (accuracy) => {
    if (accuracy === null || accuracy === undefined) return "text-foreground";
    if (accuracy >= 80) return "text-green-500";
    if (accuracy >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const metrics = [
    {
      label: "Learning Activities",
      value: summary.learningActivityCount || 0,
      icon: BookOpen,
      iconColor: "text-blue-500",
    },
    {
      label: "Practice Sessions",
      value: summary.practiceSessionCount || 0,
      icon: Target,
      iconColor: "text-purple-500",
    },
    {
      label: "Topics Tracked",
      value: summary.uniqueTopicCount || 0,
      icon: Layers,
      iconColor: "text-indigo-500",
    },
    {
      label: "Average Accuracy",
      value:
        summary.averageAccuracy !== null ? `${summary.averageAccuracy}%` : "—",
      icon: Percent,
      iconColor: getAccuracyColor(summary.averageAccuracy),
      valueColor: getAccuracyColor(summary.averageAccuracy),
    },
    {
      label: "Questions Answered",
      value: summary.totalQuestionsAnswered || summary.totalQuestions || 0,
      icon: HelpCircle,
      iconColor: "text-teal-500",
    },
    {
      label: "Current Streak",
      value: streak?.currentStreak || 0,
      icon: Flame,
      iconColor:
        streak?.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
              <Icon className={cn("h-6 w-6 mb-1", metric.iconColor)} />
              <p
                className={cn(
                  "text-2xl font-bold tracking-tight",
                  metric.valueColor || "text-foreground",
                )}
              >
                {metric.value}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {metric.label}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
