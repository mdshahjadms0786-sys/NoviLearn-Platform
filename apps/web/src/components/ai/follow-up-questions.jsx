"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export function FollowUpQuestions({ questions, onSelect }) {
  return (
    <section aria-labelledby="follow-up-questions-heading">
      <Card>
        <CardHeader>
          <CardTitle id="follow-up-questions-heading" className="text-lg">
            Keep learning
          </CardTitle>
          <CardDescription>
            Pick a follow-up question to keep exploring this topic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {questions.map((question, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                className="h-auto w-full justify-start py-3 text-left"
                onClick={() => onSelect(question)}
              >
                <ArrowRight
                  className="mr-2 h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
