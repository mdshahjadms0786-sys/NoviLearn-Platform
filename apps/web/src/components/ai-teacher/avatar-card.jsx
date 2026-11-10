"use client";

import { Check } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AvatarCard({ avatar, isSelected, onSelect }) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:scale-[1.02] relative p-4 flex flex-col items-center text-center gap-3",
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "hover:border-primary/50",
      )}
      onClick={() => onSelect(avatar.id)}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
          <Check className="w-4 h-4" />
        </div>
      )}
      <div className="text-5xl">{avatar.emoji}</div>
      <div>
        <h4 className="font-semibold">{avatar.name}</h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {avatar.description}
        </p>
      </div>
    </Card>
  );
}
