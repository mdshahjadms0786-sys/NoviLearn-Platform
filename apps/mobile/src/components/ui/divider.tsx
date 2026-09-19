'use client';

import { StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '../../theme-provider';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export function Divider({ orientation = 'horizontal', style }: DividerProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        { backgroundColor: theme.colors.outline },
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});