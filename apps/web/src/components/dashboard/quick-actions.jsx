"use client";

import { BookOpen, Dumbbell, TrendingUp, User } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
const QUICK_ACTIONS = [
  {
    href: "/learn",
    label: "Start learning",
    description: "Explore a new topic",
    icon: BookOpen,
  },
  {
    href: "/practice",
    label: "Practice",
    description: "Reinforce what you know",
    icon: Dumbbell,
  },
  {
    href: "/progress",
    label: "View progress",
    description: "Track your journey",
    icon: TrendingUp,
  },
  {
    href: "/account",
    label: "My profile",
    description: "Manage your account",
    icon: User,
  },
];
export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2
        id="quick-actions-heading"
        className="mb-3 text-lg font-semibold tracking-tight"
      >
        Quick actions
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.href}
              className="transition-colors hover:border-primary/50"
            >
              <Button
                asChild
                variant="ghost"
                className="flex h-auto w-full flex-col items-start justify-start gap-3 whitespace-normal p-5 text-left"
              >
                <Link href={action.href}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">
                      {action.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {action.description}
                    </span>
                  </span>
                </Link>
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
