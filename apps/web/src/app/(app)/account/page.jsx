"use client";

import { Bot, Languages, Sparkles, UserCheck } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api";
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
  const token = useAuthStore((s) => s.token);
  const [preferences, setPreferences] = React.useState(null);
  const [activeAvatar, setActiveAvatar] = React.useState(null);

  React.useEffect(() => {
    if (!token) return;
    apiClient("/preferences", { token })
      .then((data) => setPreferences(data))
      .catch(() => {});

    apiClient("/preferences/avatar/active", { token })
      .then((data) => setActiveAvatar(data))
      .catch(() => {});
  }, [token]);

  if (user === null) {
    return null;
  }

  const avatarName = activeAvatar?.avatarData?.name || "Nova";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your NoviLearn student profile and learning settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account information</CardTitle>
          <CardDescription>Your personal student credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-base font-bold bg-primary text-primary-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold leading-none">{user.name}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Account Role</p>
              <p className="text-xs text-muted-foreground">
                Active student membership
              </p>
            </div>
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">AI Learning Profile</CardTitle>
            <CardDescription>
              Your personal AI Teacher and teaching preferences
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/ai-teacher">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Customize
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-3 bg-muted/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
                <Bot className="h-4 w-4 text-primary" />
                <span>Active AI Teacher</span>
              </div>
              <p className="text-sm font-bold text-foreground capitalize">
                {avatarName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Custom persona for structured lessons
              </p>
            </div>

            <div className="rounded-xl border p-3 bg-muted/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
                <Languages className="h-4 w-4 text-primary" />
                <span>Preferred Language</span>
              </div>
              <p className="text-sm font-bold text-foreground capitalize">
                {preferences?.language || "English"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Explanation and practice language
              </p>
            </div>

            <div className="rounded-xl border p-3 bg-muted/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
                <UserCheck className="h-4 w-4 text-primary" />
                <span>Teaching Style</span>
              </div>
              <p className="text-sm font-bold text-foreground capitalize">
                {preferences?.teachingStyle || "Friendly"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pacing and feedback tone
              </p>
            </div>

            <div className="rounded-xl border p-3 bg-muted/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Explanation Depth</span>
              </div>
              <p className="text-sm font-bold text-foreground capitalize">
                {preferences?.explanationLevel || "Balanced"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complexity of AI concept responses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account actions</CardTitle>
          <CardDescription>Manage your active browser session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
