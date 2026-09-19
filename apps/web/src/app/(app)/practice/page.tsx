'use client';

import { Dumbbell } from 'lucide-react';

import { ComingSoon } from '@/components/placeholder/coming-soon';

export default function PracticePage() {
  return (
    <ComingSoon
      title="Practice"
      heading="Practice experiences are on the way"
      description="Practice experiences to reinforce your learning will be introduced in a future phase."
      icon={
        <Dumbbell
          className="h-8 w-8 text-muted-foreground"
          aria-hidden="true"
        />
      }
    />
  );
}
