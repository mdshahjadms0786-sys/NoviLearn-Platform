"use client";

import { Controller } from "react-hook-form";

import { Input } from "../ui/input";
export function AuthFormField({
  name,
  control,
  label,
  placeholder,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  autoComplete,
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <Input
          label={label}
          {...(placeholder
            ? {
                placeholder,
              }
            : {})}
          {...(secureTextEntry !== undefined
            ? {
                secureTextEntry,
              }
            : {})}
          {...(autoCapitalize !== undefined
            ? {
                autoCapitalize,
              }
            : {})}
          {...(keyboardType !== undefined
            ? {
                keyboardType,
              }
            : {})}
          {...(autoComplete !== undefined
            ? {
                autoComplete,
              }
            : {})}
          value={typeof value === "string" ? value : ""}
          onChangeText={onChange}
          onBlur={onBlur}
          {...(fieldState.error?.message
            ? {
                error: fieldState.error.message,
              }
            : {})}
        />
      )}
    />
  );
}
