import { DesignSystemShowcase } from "./showcase";
export const metadata = {
  title: "Design System - NoviLearn",
  description: "Component library and design system documentation",
};
export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-background">
      <DesignSystemShowcase />
    </main>
  );
}
