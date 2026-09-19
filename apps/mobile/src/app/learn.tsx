"use client";

import { useLocalSearchParams } from "expo-router";

import { AiTutor } from "../components/ai/ai-tutor";
import { AppShell } from "../components/layout/app-shell";

export default function LearnScreen() {
  const params = useLocalSearchParams<{ q?: string | string[] }>();
  const initialQuestion = typeof params.q === "string" ? params.q : undefined;

  return (
    <AppShell>
      <AiTutor initialQuestion={initialQuestion} />
    </AppShell>
  );
}
