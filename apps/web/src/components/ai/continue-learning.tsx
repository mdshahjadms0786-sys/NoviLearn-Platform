"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ContinueLearningProps {
  topics: string[];
}

export function ContinueLearning({ topics }: ContinueLearningProps) {
  const router = useRouter();

  return (
    <section aria-labelledby="continue-learning-heading">
      <Card>
        <CardHeader>
          <CardTitle id="continue-learning-heading" className="text-lg">
            Continue learning
          </CardTitle>
          <CardDescription>Take the next step in this path.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {topics.map((topic, index) => (
              <li key={index}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto w-full justify-start py-3 text-left"
                  onClick={() =>
                    router.push(`/learn?q=${encodeURIComponent(topic)}`)
                  }
                >
                  <span
                    className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1">{topic}</span>
                  <ArrowRight
                    className="ml-2 h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Button>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </section>
  );
}
