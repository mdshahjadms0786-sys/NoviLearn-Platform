"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PracticeCtaProps {
  topic: string;
}

export function PracticeCta({ topic }: PracticeCtaProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Ready to test what you learned?
        </CardTitle>
        <CardDescription>
          Reinforce the topic with a short interactive practice session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() =>
            router.push(`/practice?topic=${encodeURIComponent(topic)}`)
          }
        >
          Practice This Topic
        </Button>
      </CardContent>
    </Card>
  );
}
