"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";

import { PracticeTutor } from "@/components/practice/practice-tutor";

function PracticeContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") ?? undefined;

  return <PracticeTutor initialTopic={initialTopic} />;
}

export default function PracticePage() {
  return (
    <React.Suspense fallback={null}>
      <PracticeContent />
    </React.Suspense>
  );
}
