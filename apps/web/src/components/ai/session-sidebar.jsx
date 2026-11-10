"use client";

import { Plus, MessageSquare, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function SessionList({
  sessions,
  currentSessionId,
  onSelectSession,
  _onNewSession,
}) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="mb-4 h-8 w-8 text-muted-foreground opacity-20" />
        <p className="text-sm text-muted-foreground">No sessions yet.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Start a new conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => onSelectSession(session.id)}
          className={cn(
            "flex w-full flex-col items-start gap-1 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
            currentSessionId === session.id
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground",
          )}
        >
          <span className="truncate w-full block">
            {session.title || "New Conversation"}
          </span>
          <span className="text-xs opacity-60">
            {new Date(
              session.updatedAt || session.createdAt || Date.now(),
            ).toLocaleDateString()}
          </span>
        </button>
      ))}
    </div>
  );
}

export function SessionSidebar({
  sessions = [],
  currentSessionId,
  onSelectSession,
  onNewSession,
}) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden h-[calc(100vh-10rem)] w-64 flex-col rounded-xl border md:flex overflow-hidden bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold tracking-tight">Sessions</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewSession}
            title="New Session"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SessionList
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={onSelectSession}
            onNewSession={onNewSession}
          />
        </div>
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-between mb-4"
            >
              <span>View Sessions</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetHeader className="p-4 border-b text-left">
              <div className="flex items-center justify-between">
                <SheetTitle>Sessions</SheetTitle>
                <Button variant="ghost" size="icon" onClick={onNewSession}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">
              <SessionList
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelectSession={onSelectSession}
                onNewSession={onNewSession}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
