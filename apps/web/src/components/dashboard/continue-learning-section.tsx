'use client';

import { PlayCircle } from 'lucide-react';
import Link from 'next/link';

import { DashboardSection } from '@/components/dashboard/dashboard-section';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';

export function ContinueLearningSection() {
  return (
    <DashboardSection
      title="Continue learning"
      description="Pick up where you left off"
    >
      <EmptyState
        icon={
          <PlayCircle
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
        }
        title="Nothing in progress yet"
        description="When you start a learning path, your progress will appear here."
        action={
          <Button asChild>
            <Link href="/learn">Explore learning</Link>
          </Button>
        }
      />
    </DashboardSection>
  );
}
