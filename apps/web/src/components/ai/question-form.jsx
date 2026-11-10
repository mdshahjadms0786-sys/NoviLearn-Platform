"use client";

import { Paperclip, Sparkles } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const QUICK_TOPICS = [
  "Photosynthesis",
  "Newton's First Law",
  "Cellular Respiration",
  "Python Loops",
];

export function QuestionForm({
  fieldId,
  title,
  description,
  placeholder,
  buttonLabel,
  question,
  onChange,
  onSubmit,
  disabled,
  canSubmit,
}) {
  const fileInputRef = React.useRef(null);
  const [attachedFile, setAttachedFile] = React.useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(question);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
      if (!question.trim()) {
        onChange(`Explain key concepts from ${file.name}`);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label htmlFor={fieldId} className="sr-only">
            {buttonLabel}
          </label>
          <div className="relative flex-1">
            <Input
              id={fieldId}
              value={question}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              autoComplete="off"
              disabled={disabled}
              className="pr-10"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt,.docx,.png,.jpg"
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Attach study notes or PDF"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          <Button type="submit" disabled={!canSubmit}>
            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
            {buttonLabel}
          </Button>
        </form>

        {attachedFile && (
          <div className="flex items-center gap-2 text-xs text-primary font-medium bg-primary/5 border border-primary/20 rounded-md px-3 py-1.5 w-fit">
            <Paperclip className="h-3.5 w-3.5" />
            <span>Attached: {attachedFile}</span>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-muted-foreground">
            Try asking:
          </span>
          {QUICK_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => onChange(topic)}
              className="rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              {topic}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
