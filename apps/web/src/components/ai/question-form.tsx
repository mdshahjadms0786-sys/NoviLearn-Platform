"use client";

import { Sparkles } from "lucide-react";
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

interface QuestionFormProps {
  fieldId: string;
  title: string;
  description: string;
  placeholder?: string;
  buttonLabel: string;
  question: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  disabled: boolean;
  canSubmit: boolean;
}

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
}: QuestionFormProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(question);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label htmlFor={fieldId} className="sr-only">
            {buttonLabel}
          </label>
          <Input
            id={fieldId}
            value={question}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            disabled={disabled}
            className="flex-1"
          />
          <Button type="submit" disabled={!canSubmit}>
            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
            {buttonLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
