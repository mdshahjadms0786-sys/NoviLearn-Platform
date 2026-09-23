"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";

import { AiTutor } from "@/components/ai/ai-tutor";
function LearnContent() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("q") ?? undefined;
  return <AiTutor initialQuestion={initialQuestion} />;
}
export default function LearnPage() {
  return (
    <React.Suspense fallback={null}>
      <LearnContent />
    </React.Suspense>
  );
}
