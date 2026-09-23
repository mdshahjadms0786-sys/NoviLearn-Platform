"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const handleSubmit = (event) => {
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
