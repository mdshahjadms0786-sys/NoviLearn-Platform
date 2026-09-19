'use client';

interface WelcomeSectionProps {
  userName: string;
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
  return (
    <section aria-labelledby="dashboard-welcome-heading" className="space-y-2">
      <h1
        id="dashboard-welcome-heading"
        className="text-3xl font-bold tracking-tight"
      >
        Welcome back, {userName}
      </h1>
      <p className="text-muted-foreground">
        Your personalized learning home is ready. Explore a topic, keep going,
        or check your progress.
      </p>
    </section>
  );
}
