"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function WeakTopicsSection({ topics }) {
  const weakTopics = topics
    .filter((t) => t.averageAccuracy < 60 && t.practiceCount >= 2)
    .slice(0, 6);

  if (weakTopics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Areas to Improve</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Great job! No weak areas detected.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Areas to Improve</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {weakTopics.map((topic) => (
          <div
            key={topic.topic}
            className="flex flex-col gap-3 rounded-lg border p-4"
          >
            <div>
              <p className="font-medium line-clamp-2" title={topic.topic}>
                {topic.topic}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge
                variant={topic.averageAccuracy < 40 ? "destructive" : "warning"}
              >
                {topic.averageAccuracy}% Accuracy
              </Badge>
              <span>({topic.practiceCount} practiced)</span>
            </div>
            <div className="mt-auto flex items-center gap-2 pt-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/learn?q=${encodeURIComponent(topic.topic)}`}>
                  Review
                </Link>
              </Button>
              <Button asChild size="sm" className="w-full">
                <Link
                  href={`/practice?topic=${encodeURIComponent(topic.topic)}`}
                >
                  Practice
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
