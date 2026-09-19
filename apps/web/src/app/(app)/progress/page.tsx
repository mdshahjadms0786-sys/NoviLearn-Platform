'use client';

import { TrendingUp } from 'lucide-react';

import { ComingSoon } from '@/components/placeholder/coming-soon';

export default function ProgressPage() {
  return (
    <ComingSoon
      title="Progress"
      heading="Progress tracking is coming soon"
      description="Progress tracking will be available in a future phase."
      icon={
        <TrendingUp
          className="h-8 w-8 text-muted-foreground"
          aria-hidden="true"
        />
      }
    />
  );
}
