"use client";

import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Controller } from "react-hook-form";
import { Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../theme-provider";
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
  showPasswordToggle,
}) {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);
  const effectiveSecureTextEntry = secureTextEntry && !showPassword;
  const renderIconRight = () => {
    if (!showPasswordToggle || !secureTextEntry) return null;
    return (
      <Pressable
        style={styles.iconButton}
        onPress={() => setShowPassword((prev) => !prev)}
        accessibilityLabel={showPassword ? "Hide password" : "Show password"}
      >
        <Ionicons
          name={showPassword ? "eye-off-outline" : "eye-outline"}
          size={22}
          color={theme.colors.onSurfaceVariant}
        />
      </Pressable>
    );
  };
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
          {...(effectiveSecureTextEntry !== undefined
            ? {
                secureTextEntry: effectiveSecureTextEntry,
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
          iconRight={renderIconRight()}
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
const styles = StyleSheet.create({
  iconButton: {
    padding: 4,
  },
});
