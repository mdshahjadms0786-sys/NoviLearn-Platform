import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LandingCta() {
  return (
    <section className="border-t bg-muted/30 py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary via-primary/95 to-primary/80 p-8 sm:p-12 text-center text-primary-foreground shadow-sm">
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to learn something new today?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/90 sm:text-base">
            Create your free account and start exploring concepts with your AI
            tutor.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-background text-primary hover:bg-background/90"
              asChild
            >
              <Link href="/signup">
                Start learning free
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
