import Link from 'next/link';

import { AuthLinks } from '@/components/auth/auth-links';
import { AuthenticatedRedirect } from '@/components/auth/authenticated-redirect';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <AuthenticatedRedirect />
      <div className="mt-16 flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-center sm:text-6xl">
          NoviLearn
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl text-center">
          AI-powered learning platform for students
        </p>
        <div className="flex gap-4">
          <AuthLinks />
          <Button asChild>
            <a href="/api/health">Check API Health</a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/design-system">Design System</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
