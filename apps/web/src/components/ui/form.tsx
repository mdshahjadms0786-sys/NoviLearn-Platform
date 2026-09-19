'use client';

import * as React from 'react';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';

import { Input } from './input';
import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Textarea } from './textarea';

interface FormFieldProps<T extends FieldValues> extends Omit<
  UseControllerProps<T>,
  'name' | 'control' | 'render'
> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  hint?: string;
  error?: string | undefined;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}

export function FormField<T extends FieldValues>({
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
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      {...(rules ? { rules } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <Input
          ref={ref}
          id={name}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          value={value as string}
          {...(placeholder ? { placeholder } : {})}
          {...(type ? { type } : {})}
          {...(autoComplete ? { autoComplete } : {})}
          {...(label ? { label } : {})}
          {...(hint ? { hint } : {})}
          {...(error ? { error } : {})}
        />
      )}
    />
  );
}

interface FormTextareaProps<T extends FieldValues> extends Omit<
  UseControllerProps<T>,
  'name' | 'control' | 'render'
> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
}

export function FormTextarea<T extends FieldValues>({
  name,
  control,
  label,
  hint,
  error,
  rules,
  defaultValue,
  placeholder,
}: FormTextareaProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      {...(rules ? { rules } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <Textarea
          ref={ref}
          id={name}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          value={value as string}
          {...(placeholder ? { placeholder } : {})}
          {...(label ? { label } : {})}
          {...(hint ? { hint } : {})}
          {...(error ? { error } : {})}
        />
      )}
    />
  );
}

interface FormSelectProps<T extends FieldValues> extends Omit<
  UseControllerProps<T>,
  'name' | 'control' | 'render'
> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  hint,
  error,
  rules,
  defaultValue,
  options,
  placeholder,
}: FormSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      {...(rules ? { rules } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
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
          <Select
            onValueChange={onChange}
            onOpenChange={onBlur}
            value={value as string}
          >
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
