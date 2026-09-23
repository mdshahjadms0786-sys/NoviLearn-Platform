"use client";

import { View } from "react-native";

import { useTheme } from "../../theme-provider";
export function Skeleton({
  style,
  width = "100%",
  height = 16,
  borderRadius = 8,
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surfaceVariant,
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
}
