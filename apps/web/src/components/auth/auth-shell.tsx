import * as React from 'react';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">NoviLearn</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-powered learning platform for students
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
