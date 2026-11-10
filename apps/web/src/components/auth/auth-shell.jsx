"use client";

import { GraduationCap } from "lucide-react";

export function AuthShell({ children }) {
  return (
    <main className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center px-12 py-16 text-white">
        <div className="max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <GraduationCap className="h-7 w-7" aria-hidden="true" />
            </div>
            <span className="text-2xl font-bold">NoviLearn</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Learn anything, your way.
          </h2>
          <p className="text-lg text-white/80 mb-12">
            An AI-powered learning platform for students. Understand concepts,
            practice what you learn, and track your progress.
          </p>
          <div className="space-y-4 text-white/90">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="font-medium">Structured lessons</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="font-medium">Built-in practice</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="font-medium">Visible progress</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <GraduationCap
                  className="h-7 w-7 text-primary-foreground"
                  aria-hidden="true"
                />
              </div>
              <span className="text-2xl font-bold text-foreground">
                NoviLearn
              </span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
