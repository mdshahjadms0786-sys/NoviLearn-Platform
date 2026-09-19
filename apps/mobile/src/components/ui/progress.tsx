'use client';

import * as React from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '../../theme-provider';

type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressProps {
  value: number;
  max?: number;
  size?: ProgressSize;
  animated?: boolean;
  showLabel?: boolean;
  style?: ViewStyle;
}

const sizeStyles: Record<ProgressSize, { height: number; borderRadius: number }> = {
  sm: { height: 4, borderRadius: 2 },
  md: { height: 8, borderRadius: 4 },
  lg: { height: 12, borderRadius: 6 },
};

export function Progress({
  value,
  max = 100,
  size = 'md',
  animated = true,
  showLabel = false,
  style,
}: ProgressProps) {
  const { theme } = useTheme();
  const sizes = sizeStyles[size];
  const progress = Math.min(Math.max(value / max, 0), 1);

  const animatedValue = React.useRef(new Animated.Value(animated ? 0 : progress)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, animatedValue]);

  const width = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant, height: sizes.height, borderRadius: sizes.borderRadius }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: theme.colors.primary, borderRadius: sizes.borderRadius, width },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 4,
  },
  track: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  label: {
    fontSize: 12,
    fontFamily: 'System',
    textAlign: 'right',
  },
});