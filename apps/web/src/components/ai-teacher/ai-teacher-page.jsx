"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

import { AvatarCard } from "./avatar-card";

const preferencesApi = {
  getPreferences: (token) => apiClient("/preferences", { token }),
  updatePreferences: (token, updates) =>
    apiClient("/preferences", { method: "PATCH", body: updates, token }),
  listAvatars: (token) => apiClient("/preferences/avatars", { token }),
  getActiveAvatar: (token) =>
    apiClient("/preferences/avatar/active", { token }),
  setAvatar: (token, body) =>
    apiClient("/preferences/avatar", { method: "POST", body, token }),
};

export function AITeacherPage() {
  const { token } = useAuthStore();
  const [avatars, setAvatars] = useState([]);
  const [activeAvatarId, setActiveAvatarId] = useState(null);

  const [preferences, setPreferences] = useState({
    language: "English",
    explanationLevel: "Balanced",
    teachingStyle: "Friendly",
    goals: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    Promise.all([
      preferencesApi.listAvatars(token).catch(() => []),
      preferencesApi.getActiveAvatar(token).catch(() => null),
      preferencesApi.getPreferences(token).catch(() => null),
    ])
      .then(([avatarsList, activeAvatar, prefs]) => {
        setAvatars(avatarsList || []);
        if (activeAvatar) setActiveAvatarId(activeAvatar.id);
        if (prefs) {
          setPreferences({
            language: prefs.language || "English",
            explanationLevel: prefs.explanationLevel || "Balanced",
            teachingStyle: prefs.teachingStyle || "Friendly",
            goals: prefs.goals || "",
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load settings.");
        setLoading(false);
      });
  }, [token]);

  const handleAvatarSelect = async (id) => {
    setActiveAvatarId(id);
    try {
      await preferencesApi.setAvatar(token, { avatarId: id });
    } catch {
      // Ignored for UI responsiveness
    }
  };

  const handlePrefChange = (field, value) => {
    const newPrefs = { ...preferences, [field]: value };
    setPreferences(newPrefs);
  };

  const savePreferences = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      await preferencesApi.updatePreferences(token, preferences);
      setSaveMessage("Preferences saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      setSaveMessage("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading AI Teacher settings..." />;
  if (error) return <ErrorState title="Error" description={error} />;

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Teacher</h1>
        <p className="text-muted-foreground mt-2">
          Customize your AI learning experience.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Choose Your Teacher</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {avatars.map((avatar) => (
            <AvatarCard
              key={avatar.id}
              avatar={avatar}
              isSelected={activeAvatarId === avatar.id}
              onSelect={handleAvatarSelect}
            />
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Teaching Preferences</CardTitle>
          <CardDescription>
            Adjust how the AI teacher explains concepts to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="pref-language" className="text-sm font-medium">
                Language
              </label>
              <select
                id="pref-language"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={preferences.language}
                onChange={(e) => handlePrefChange("language", e.target.value)}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="pref-level" className="text-sm font-medium">
                Explanation Level
              </label>
              <select
                id="pref-level"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={preferences.explanationLevel}
                onChange={(e) =>
                  handlePrefChange("explanationLevel", e.target.value)
                }
              >
                <option value="Simple">Simple</option>
                <option value="Balanced">Balanced</option>
                <option value="Detailed">Detailed</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="pref-style" className="text-sm font-medium">
                Teaching Style
              </label>
              <select
                id="pref-style"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={preferences.teachingStyle}
                onChange={(e) =>
                  handlePrefChange("teachingStyle", e.target.value)
                }
              >
                <option value="Friendly">Friendly</option>
                <option value="Formal">Formal</option>
                <option value="Casual">Casual</option>
                <option value="Strict">Strict</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="pref-goals" className="text-sm font-medium">
              Learning Goals
            </label>
            <textarea
              id="pref-goals"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              placeholder="E.g., I want to master full-stack development..."
              value={preferences.goals}
              onChange={(e) => handlePrefChange("goals", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={savePreferences} disabled={saving}>
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
            {saveMessage && (
              <span className="text-sm text-muted-foreground">
                {saveMessage}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
