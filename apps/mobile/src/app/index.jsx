"use client";

import { DashboardHome } from "../components/dashboard/dashboard-home";
import { AppShell } from "../components/layout/app-shell";
export default function HomeScreen() {
  return (
    <AppShell>
      <DashboardHome />
    </AppShell>
  );
}
