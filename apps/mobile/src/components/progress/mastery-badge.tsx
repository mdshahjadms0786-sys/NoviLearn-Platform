import type { MasteryState } from "@novilearn/types";

import { Badge } from "../ui/badge";

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

interface MasteryBadgeProps {
  mastery: MasteryState;
}

export function MasteryBadge({ mastery }: MasteryBadgeProps) {
  return (
    <Badge variant={MASTERY_VARIANTS[mastery]}>{MASTERY_LABELS[mastery]}</Badge>
  );
}
