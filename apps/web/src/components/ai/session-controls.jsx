"use client";

import {
  Lightbulb,
  FileText,
  Code,
  Eye,
  GraduationCap,
  Languages,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const MODES = [
  { id: "simple", label: "Simple", icon: Lightbulb },
  { id: "detailed", label: "Detailed", icon: FileText },
  { id: "example", label: "Example", icon: Code },
  { id: "visual", label: "Visual", icon: Eye },
  { id: "exam", label: "Exam", icon: GraduationCap },
  { id: "hinglish", label: "Hinglish", icon: Languages },
];

export function SessionControls({ activeMode, onModeChange, disabled }) {
  return (
    <div className="flex w-full overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible md:pb-0">
      <div className="flex gap-2">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <Button
              key={mode.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onModeChange(mode.id)}
              disabled={disabled}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              <span>{mode.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
