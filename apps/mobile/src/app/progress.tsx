"use client";

import { AppShell } from "../components/layout/app-shell";
import { ProgressDashboard } from "../components/progress/progress-dashboard";

export default function ProgressScreen() {
  return (
    <AppShell>
      <ProgressDashboard />
    </AppShell>
  );
}
