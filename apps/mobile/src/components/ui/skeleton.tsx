'use client';

import { DimensionValue, View, ViewStyle } from 'react-native';

import { useTheme } from '../../theme-provider';

interface SkeletonProps {
  style?: ViewStyle;
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({ style, width = '100%', height = 16, borderRadius = 8 }: SkeletonProps) {
  const { theme } = useTheme();

  return (
    <View style={[{ backgroundColor: theme.colors.surfaceVariant, width, height, borderRadius }, style]} />
  );
}