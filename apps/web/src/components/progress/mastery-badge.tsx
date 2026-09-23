"use client";

import type { MasteryState } from "@novilearn/types";

import { Badge } from "@/components/ui/badge";

const MASTERY_VARIANTS: Record<
  MasteryState,
  "outline" | "info" | "warning" | "success"
> = {
  NOT_STARTED: "outline",
  LEARNING: "info",
  PRACTICING: "warning",
  STRONG: "success",
};

const MASTERY_LABELS: Record<MasteryState, string> = {
  NOT_STARTED: "Not started",
  LEARNING: "Learning",
  PRACTICING: "Practicing",
  STRONG: "Strong",
};

export function MasteryBadge({ mastery }: { mastery: MasteryState }) {
  return (
    <Badge
      variant={MASTERY_VARIANTS[mastery]}
      aria-label={`Mastery: ${MASTERY_LABELS[mastery]}`}
    >
      {MASTERY_LABELS[mastery]}
    </Badge>
  );
}
