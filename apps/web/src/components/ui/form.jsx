"use client";

import { Controller } from "react-hook-form";

import { Input } from "./input";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Textarea } from "./textarea";
export function FormField({
  name,
  control,
  label,
  hint,
  error,
  rules,
  defaultValue,
  placeholder,
  type,
  autoComplete,
}) {
  return (
    <Controller
      name={name}
      control={control}
      {...(rules
        ? {
            rules,
          }
        : {})}
      {...(defaultValue !== undefined
        ? {
            defaultValue,
          }
        : {})}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <Input
          ref={ref}
          id={name}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          {...(placeholder
            ? {
                placeholder,
              }
            : {})}
          {...(type
            ? {
                type,
              }
            : {})}
          {...(autoComplete
            ? {
                autoComplete,
              }
            : {})}
          {...(label
            ? {
                label,
              }
            : {})}
          {...(hint
            ? {
                hint,
              }
            : {})}
          {...(error
            ? {
                error,
              }
            : {})}
        />
      )}
    />
  );
}
export function FormTextarea({
  name,
  control,
  label,
  hint,
  error,
  rules,
  defaultValue,
  placeholder,
}) {
  return (
    <Controller
      name={name}
      control={control}
      {...(rules
        ? {
            rules,
          }
        : {})}
      {...(defaultValue !== undefined
        ? {
            defaultValue,
          }
        : {})}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <Textarea
          ref={ref}
          id={name}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          {...(placeholder
            ? {
                placeholder,
              }
            : {})}
          {...(label
            ? {
                label,
              }
            : {})}
          {...(hint
            ? {
                hint,
              }
            : {})}
          {...(error
            ? {
                error,
              }
            : {})}
        />
      )}
    />
  );
}
export function FormSelect({
  name,
  control,
  label,
  hint,
  error,
  rules,
  defaultValue,
  options,
  placeholder,
}) {
  return (
    <Controller
      name={name}
      control={control}
      {...(rules
        ? {
            rules,
          }
        : {})}
      {...(defaultValue !== undefined
        ? {
            defaultValue,
          }
        : {})}
      render={({ field: { onChange, onBlur, value } }) => (
        <div className="w-full">
          {label && (
            <Label
              htmlFor={name}
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {label}
            </Label>
          )}
          <Select onValueChange={onChange} onOpenChange={onBlur} value={value}>
            <SelectTrigger id={name} aria-invalid={!!error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="mt-1.5 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {hint && !error && (
            <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
          )}
        </div>
      )}
    />
  );
}
