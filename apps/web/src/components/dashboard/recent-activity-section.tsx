'use client';

import { History } from 'lucide-react';
import Link from 'next/link';

import { DashboardSection } from '@/components/dashboard/dashboard-section';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';

export function RecentActivitySection() {
  return (
    <DashboardSection
      title="Recent activity"
      description="Your latest learning moments"
    >
      <EmptyState
        icon={
          <History
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
        }
        title="No activity yet"
        description="Your completed lessons, questions, and milestones will show up here."
        action={
          <Button asChild>
            <Link href="/learn">Start learning</Link>
          </Button>
        }
      />
    </DashboardSection>
  );
}
