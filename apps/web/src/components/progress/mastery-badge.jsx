"use client";

import { Badge } from "@/components/ui/badge";
const MASTERY_VARIANTS = {
  NOT_STARTED: "outline",
  LEARNING: "info",
  PRACTICING: "warning",
  STRONG: "success",
};
const MASTERY_LABELS = {
  NOT_STARTED: "Not started",
  LEARNING: "Learning",
  PRACTICING: "Practicing",
  STRONG: "Strong",
};
export function MasteryBadge({ mastery }) {
  return (
    <Badge
      variant={MASTERY_VARIANTS[mastery]}
      aria-label={`Mastery: ${MASTERY_LABELS[mastery]}`}
    >
      {MASTERY_LABELS[mastery]}
    </Badge>
  );
}
