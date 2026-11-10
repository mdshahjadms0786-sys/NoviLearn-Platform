import { BookOpen, CheckCircle2, HelpCircle, TrendingUp } from "lucide-react";

import { SectionHeading } from "@/components/landing/section-heading";

const STEPS = [
  {
    icon: HelpCircle,
    step: "1",
    title: "Ask",
    description: "Enter any topic or concept you want to learn.",
  },
  {
    icon: BookOpen,
    step: "2",
    title: "Learn",
    description:
      "Get structured lessons with key points and visual breakdowns.",
  },
  {
    icon: CheckCircle2,
    step: "3",
    title: "Practice",
    description: "Test your understanding with instant quiz evaluations.",
  },
  {
    icon: TrendingUp,
    step: "4",
    title: "Improve",
    description: "Identify weak spots and track your knowledge retention.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeading
          eyebrow="How it works"
          title="A simple, effective learning loop"
        />
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="relative">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border bg-background text-primary shadow-xs">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border bg-background text-[10px] font-semibold text-muted-foreground">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
