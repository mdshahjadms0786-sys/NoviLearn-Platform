'use client';

import * as React from 'react';
import { Text, View, ViewStyle } from 'react-native';

import { useTheme } from '../../theme-provider';

type BadgeVariant =
  'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: 'primary', text: 'onPrimary' },
  success: { bg: '#22c55e', text: '#ffffff' },
  warning: { bg: '#f59e0b', text: '#ffffff' },
  error: { bg: '#ef4444', text: '#ffffff' },
  info: { bg: '#3b82f6', text: '#ffffff' },
  outline: { bg: 'transparent', text: 'primary' },
};

const sizeStyles: Record<
  BadgeSize,
  {
    paddingHorizontal: number;
    paddingVertical: number;
    fontSize: number;
    borderRadius: number;
  }
> = {
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    borderRadius: 4,
  },
  md: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    borderRadius: 6,
  },
  lg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    borderRadius: 8,
  },
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  const { theme } = useTheme();
  const colors = variantColors[variant];
  const sizes = sizeStyles[size];

  const bgColor =
    colors.bg === 'primary'
      ? theme.colors.primary
      : colors.bg === 'transparent'
        ? 'transparent'
        : colors.bg;
  const textColor =
    colors.text === 'onPrimary'
      ? theme.colors.onPrimary
      : colors.text === 'primary'
        ? theme.colors.primary
        : colors.text;

  return (
    <View
      className="flex-row items-center justify-center"
      style={[
        {
          backgroundColor: bgColor,
          borderColor:
            variant === 'outline' ? theme.colors.primary : 'transparent',
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingHorizontal: sizes.paddingHorizontal,
          paddingVertical: sizes.paddingVertical,
          borderRadius: sizes.borderRadius,
        },
        style,
      ]}
    >
      <Text
        className="font-semibold"
        style={[{ color: textColor, fontSize: sizes.fontSize }]}
      >
        {children}
      </Text>
    </View>
  );
}
