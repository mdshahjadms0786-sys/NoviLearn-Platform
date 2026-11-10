"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";

import { signupSchema } from "@novilearn/shared";

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
import { Input } from "@/components/ui/input";
import { ApiClientError } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";

function PasswordStrength({ password }) {
  const strength = React.useMemo(() => {
    if (!password)
      return { level: 0, label: "", color: "text-muted-foreground" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2)
      return { level: 1, label: "Weak", color: "text-destructive" };
    if (score <= 4)
      return { level: 2, label: "Medium", color: "text-amber-500" };
    return { level: 3, label: "Strong", color: "text-green-500" };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={strength.level}
        aria-valuemin={0}
        aria-valuemax={3}
        aria-label="Password strength"
      >
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded transition-colors ${
              level <= strength.level
                ? strength.color.replace("text-", "bg-")
                : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength.color}`}>
        {strength.label}
        {strength.level === 1 && (
          <span className="ml-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Please use a stronger password.
          </span>
        )}
      </p>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { signup, status } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const passwordValue = form.watch("password");
  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await signup(values);
      router.replace("/home");
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
      router.replace("/home");
    }
  }, [router, status]);
  return (
    <AuthShell>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Start learning with NoviLearn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {serverError !== null && (
            <Alert variant="destructive">
              <AlertTitle>Unable to create account</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <Input
                  type="text"
                  placeholder="Full name"
                  autoComplete="name"
                  label="Full name"
                  {...field}
                  error={form.formState.errors.name?.message}
                />
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <Input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  label="Email"
                  {...field}
                  error={form.formState.errors.email?.message}
                />
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      autoComplete="new-password"
                      label="Password"
                      {...field}
                      error={form.formState.errors.password?.message}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-[38px] h-8 w-8"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <PasswordStrength password={passwordValue} />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    label="Confirm password"
                    {...field}
                    error={form.formState.errors.confirmPassword?.message}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-[38px] h-8 w-8"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthShell>
  );
}
