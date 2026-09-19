'use client';

import * as React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { useTheme } from '../../theme-provider';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  icon,
  iconRight,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          { borderColor: error ? theme.colors.error : theme.colors.outline },
        ]}
      >
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <TextInput
          style={[styles.input, { color: theme.colors.onSurface }, style]}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          {...props}
        />
        {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      ) : (
        hint && (
          <Text style={[styles.hintText, { color: theme.colors.onSurfaceVariant }]}>{hint}</Text>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'System',
    paddingVertical: 12,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'System',
  },
  hintText: {
    fontSize: 12,
    fontFamily: 'System',
  },
});