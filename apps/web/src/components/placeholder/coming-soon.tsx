'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';

interface ComingSoonProps {
  title: string;
  heading: string;
  description: string;
  icon: React.ReactNode;
}

export function ComingSoon({
  title,
  heading,
  description,
  icon,
}: ComingSoonProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">
          This area of NoviLearn is under construction.
        </p>
      </div>
      <EmptyState
        icon={icon}
        title={heading}
        description={description}
        action={
          <Button asChild>
            <Link href="/home">Back to Home</Link>
          </Button>
        }
      />
    </div>
  );
}
