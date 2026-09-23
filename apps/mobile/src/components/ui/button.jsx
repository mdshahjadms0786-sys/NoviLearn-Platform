"use client";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "../../theme-provider";
export function Button({
  variant = "contained",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconRight,
  children,
  style,
  ...props
}) {
  const { theme } = useTheme();
  const sizeStyles = {
    sm: {
      height: 36,
      paddingHorizontal: 12,
      fontSize: 13,
    },
    md: {
      height: 44,
      paddingHorizontal: 16,
      fontSize: 14,
    },
    lg: {
      height: 52,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  }[size];
  const variantStyles = {
    contained: {
      backgroundColor: theme.colors.primary,
      borderColor: "transparent",
      textColor: theme.colors.onPrimary,
    },
    outlined: {
      backgroundColor: "transparent",
      borderColor: theme.colors.outline,
      textColor: theme.colors.primary,
    },
    text: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      textColor: theme.colors.primary,
    },
    elevated: {
      backgroundColor: theme.colors.surface,
      borderColor: "transparent",
      textColor: theme.colors.primary,
    },
  }[variant];
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variant === "outlined" ? 1 : 0,
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          width: fullWidth ? "100%" : undefined,
          opacity: isDisabled ? 0.6 : 1,
          elevation: variant === "elevated" ? 2 : 0,
        },
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantStyles.textColor}
            style={styles.spinner}
          />
        ) : (
          icon && <View style={styles.iconLeft}>{icon}</View>
        )}
        <Text
          style={[
            styles.label,
            {
              color: variantStyles.textColor,
              fontSize: sizeStyles.fontSize,
            },
          ]}
        >
          {children}
        </Text>
        {iconRight && !loading && (
          <View style={styles.iconRight}>{iconRight}</View>
        )}
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontWeight: "600",
    fontFamily: "System",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  spinner: {
    marginRight: 8,
  },
});
