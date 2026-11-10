import { Brain, CheckCircle, GitBranch, TrendingUp } from "lucide-react";

import { SectionHeading } from "@/components/landing/section-heading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Tutoring",
    description:
      "Ask any question and receive clear, structured explanations at your own pace.",
  },
  {
    icon: CheckCircle,
    title: "Adaptive Practice",
    description:
      "Reinforce concepts with instant quizzes and practice sets that adapt to your level.",
  },
  {
    icon: GitBranch,
    title: "Visual Explanations",
    description:
      "Understand difficult mechanisms easily through structured diagrams and flowcharts.",
  },
  {
    icon: TrendingUp,
    title: "Progress & Streaks",
    description:
      "Track your daily goals, learning streaks, and topic mastery in one place.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="border-t bg-muted/30 py-20">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to learn better"
          description="A focused learning experience built to help students understand, retain, and succeed."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <CardHeader className="gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-base font-semibold">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
