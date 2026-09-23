"use client";

import Link from "next/link";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/auth-store";
function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  if (user === null) {
    return null;
  }
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">Your NoviLearn account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account information</CardTitle>
          <CardDescription>Your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-base">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold leading-none">{user.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-sm text-muted-foreground">Student account</p>
            </div>
            <Badge variant="secondary">{user.role}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Learning profile</CardTitle>
          <CardDescription>Personalized settings and interests</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your learning preferences, goals, and interests will appear here in
            a future phase.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account actions</CardTitle>
          <CardDescription>Manage your session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <SignOutButton />
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Browse the shared component library at the{" "}
        <Link
          href="/design-system"
          className="underline underline-offset-4 hover:text-foreground"
        >
          design system
        </Link>
        .
      </p>
    </div>
  );
}
