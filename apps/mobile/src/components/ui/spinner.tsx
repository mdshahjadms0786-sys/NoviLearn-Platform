'use client';

import { ActivityIndicator, ViewStyle } from 'react-native';

import { useTheme } from '../../theme-provider';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  color?: string;
}

export function Spinner({ size = 'md', style, color }: SpinnerProps) {
  const { theme } = useTheme();
  const sizeMap = { sm: 'small', md: 'large', lg: 'large' } as const;

  return <ActivityIndicator size={sizeMap[size]} color={color || theme.colors.primary} style={style} />;
}