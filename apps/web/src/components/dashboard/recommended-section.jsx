"use client";

import { BookOpen, Dumbbell } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { progressApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const CATEGORY_LABELS = {
  continue_learning: "Continue Learning",
  practice_again: "Practice Again",
  review_weak_topic: "Review Weak Topics",
  related_next_topic: "Explore Next",
};

export function RecommendedSection() {
  const token = useAuthStore((state) => state.token);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSuggestions = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await progressApi.suggestions(token);

      // Normalize data to an array of objects if it's an object with keys
      let normalized = [];
      if (Array.isArray(data)) {
        normalized = data;
      } else if (data && typeof data === "object") {
        Object.entries(data).forEach(([category, items]) => {
          if (Array.isArray(items)) {
            items.forEach((item) => {
              normalized.push({
                category,
                topic: typeof item === "string" ? item : item.topic,
              });
            });
          }
        });
      }

      setSuggestions(normalized.slice(0, 6));
    } catch (error) {
      console.error("Failed to load suggestions", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

  return (
    <DashboardSection
      title="Recommended for You"
      description="Personalized suggestions based on your progress"
    >
      {isLoading ? (
        <LoadingState message="Loading recommendations..." />
      ) : suggestions.length === 0 ? (
        <EmptyState
          title="No recommendations yet"
          description="Start learning to get personalized recommendations"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {suggestions.map((suggestion, index) => {
            const isPractice =
              suggestion.category === "practice_again" ||
              suggestion.category === "review_weak_topic";
            const ActionIcon = isPractice ? Dumbbell : BookOpen;
            const href = isPractice
              ? `/practice?topic=${encodeURIComponent(suggestion.topic)}`
              : `/learn?q=${encodeURIComponent(suggestion.topic)}`;
            const label = CATEGORY_LABELS[suggestion.category] || "Suggested";

            return (
              <Card
                key={index}
                className="flex flex-col justify-between overflow-hidden"
              >
                <CardContent className="p-4 flex flex-col h-full gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </span>
                    <span className="font-medium text-foreground line-clamp-2">
                      {suggestion.topic}
                    </span>
                  </div>
                  <div className="mt-auto pt-2">
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      <Link href={href}>
                        <ActionIcon
                          className="mr-2 h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        {isPractice ? "Practice" : "Learn"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}
