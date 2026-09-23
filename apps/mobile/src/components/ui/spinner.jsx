"use client";

import { ActivityIndicator } from "react-native";

import { useTheme } from "../../theme-provider";
export function Spinner({ size = "md", style, color }) {
  const { theme } = useTheme();
  const sizeMap = {
    sm: "small",
    md: "large",
    lg: "large",
  };
  return (
    <ActivityIndicator
      size={sizeMap[size]}
      color={color || theme.colors.primary}
      style={style}
    />
  );
}
