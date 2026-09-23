"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";

import { loginSchema } from "@novilearn/shared";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/ui/form";
import { ApiClientError } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
export default function LoginPage() {
  const router = useRouter();
  const { login, status } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState(null);
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await login(values);
      router.replace("/");
    } catch (error) {
      setServerError(
        error instanceof ApiClientError
          ? error.error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  });
  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);
  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to continue learning.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {serverError !== null && (
            <Alert variant="destructive">
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={form.formState.errors.email?.message}
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              error={form.formState.errors.password?.message}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthShell>
  );
}
