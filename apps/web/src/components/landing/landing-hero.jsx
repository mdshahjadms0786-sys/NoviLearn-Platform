import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Subtle background gradient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-96 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        {/* Minimal pill tag */}
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>AI-Powered Learning Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-tight">
          Learn anything,{" "}
          <span className="bg-gradient-to-r from-primary via-sky-600 to-primary bg-clip-text text-transparent">
            your way
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg sm:leading-relaxed">
          Understand concepts faster, practice what you learn with adaptive
          quizzes, and track your daily learning journey.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="h-11 px-6 text-sm font-semibold" asChild>
            <Link href="/signup">
              Start learning free
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6 text-sm"
            asChild
          >
            <Link href="#features">See how it works</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
