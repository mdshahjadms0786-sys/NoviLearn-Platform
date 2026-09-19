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

interface RelatedConceptsProps {
  concepts: string[];
}

export function RelatedConcepts({ concepts }: RelatedConceptsProps) {
  const router = useRouter();

  return (
    <section aria-labelledby="related-concepts-heading">
      <Card>
        <CardHeader>
          <CardTitle id="related-concepts-heading" className="text-lg">
            Related concepts
          </CardTitle>
          <CardDescription>
            Explore connected ideas to go deeper.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {concepts.map((concept, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto rounded-full py-2 text-left"
                onClick={() =>
                  router.push(`/learn?q=${encodeURIComponent(concept)}`)
                }
              >
                {concept}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
