"use client";

import { Star } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/ui/states";
export function RecommendedSection() {
  return (
    <DashboardSection
      title="Recommended for you"
      description="Hand-picked topics to spark your curiosity"
    >
      <EmptyState
        icon={
          <Star className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        }
        title="Recommendations are coming soon"
        description="Personalized suggestions powered by your interests and progress will be introduced in a future phase."
      />
    </DashboardSection>
  );
}
