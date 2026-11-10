"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient, progressApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

function formatRelativeTime(isoDate) {
  if (!isoDate) return "";
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

const learningApi = {
  listSaved: (token) => apiClient("/learning/saved", { token }),
  listSessions: (token, limit) =>
    apiClient(`/learning?limit=${limit || 20}`, { token }),
};

export function MyLearningPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState("saved");

  const [savedState, setSavedState] = useState({
    data: [],
    loading: true,
    error: null,
  });
  const [historyState, setHistoryState] = useState({
    data: [],
    loading: true,
    error: null,
  });
  const [sessionsState, setSessionsState] = useState({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!token) return;

    if (activeTab === "saved") {
      learningApi
        .listSaved(token)
        .then((data) => setSavedState({ data, loading: false, error: null }))
        .catch((error) =>
          setSavedState({ data: [], loading: false, error: error.message }),
        );
    } else if (activeTab === "history") {
      progressApi
        .learningHistory(token, 30)
        .then((data) => setHistoryState({ data, loading: false, error: null }))
        .catch((error) =>
          setHistoryState({ data: [], loading: false, error: error.message }),
        );
    } else if (activeTab === "sessions") {
      learningApi
        .listSessions(token)
        .then((data) => setSessionsState({ data, loading: false, error: null }))
        .catch((error) =>
          setSessionsState({ data: [], loading: false, error: error.message }),
        );
    }
  }, [token, activeTab]);

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and revisit your learning sessions.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-6 space-y-4">
          {savedState.loading ? (
            <LoadingState message="Loading saved sessions..." />
          ) : savedState.error ? (
            <ErrorState title="Failed to load" description={savedState.error} />
          ) : savedState.data.length === 0 ? (
            <EmptyState
              title="No saved sessions yet"
              description="Sessions you save will appear here."
            />
          ) : (
            <div className="grid gap-4">
              {savedState.data.map((item) => (
                <Link key={item.id} href={`/learn?session=${item.id}`}>
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {item.topic}
                          </CardDescription>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(item.savedAt)}
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-4">
          {historyState.loading ? (
            <LoadingState message="Loading history..." />
          ) : historyState.error ? (
            <ErrorState
              title="Failed to load"
              description={historyState.error}
            />
          ) : historyState.data.length === 0 ? (
            <EmptyState
              title="No learning history yet"
              description="Start learning topics to see your history here."
            />
          ) : (
            <div className="grid gap-4">
              {historyState.data.map((item) => (
                <Link
                  key={item.id}
                  href={`/learn?q=${encodeURIComponent(item.topic)}`}
                >
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{item.type}</Badge>
                          <span className="font-medium">{item.topic}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(item.date)}
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="mt-6 space-y-4">
          {sessionsState.loading ? (
            <LoadingState message="Loading sessions..." />
          ) : sessionsState.error ? (
            <ErrorState
              title="Failed to load"
              description={sessionsState.error}
            />
          ) : sessionsState.data.length === 0 ? (
            <EmptyState
              title="No sessions yet"
              description="Your AI learning sessions will appear here."
            />
          ) : (
            <div className="grid gap-4">
              {sessionsState.data.map((item) => (
                <Link key={item.id} href={`/learn?session=${item.id}`}>
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">
                            {item.title || item.topic}
                          </CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-2">
                            <span>{item.messageCount || 0} messages</span>
                            <span>&bull;</span>
                            <span>{item.topic}</span>
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge>{item.status || "active"}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(item.lastUpdatedAt)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
