"use client";

import { useLocalSearchParams } from "expo-router";

import { AppShell } from "../components/layout/app-shell";
import { PracticeFlow } from "../components/practice/practice-flow";

export default function PracticeScreen() {
  const params = useLocalSearchParams<{ topic?: string | string[] }>();
  const initialTopic =
    typeof params.topic === "string" ? params.topic : undefined;

  return (
    <AppShell>
      <PracticeFlow initialTopic={initialTopic} />
    </AppShell>
  );
}
