"use client";

import * as React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "../../theme-provider";
export function SearchInput({
  placeholder = "Search...",
  onSearch,
  debounceMs = 300,
  containerStyle,
  icon,
  ...props
}) {
  const { theme } = useTheme();
  const [value, setValue] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(value);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch]);
  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
        containerStyle,
      ]}
    >
      <View style={styles.iconLeft}>
        {icon || (
          <Text
            style={[
              styles.searchIcon,
              {
                color: theme.colors.onSurfaceVariant,
              },
            ]}
          >
            🔍
          </Text>
        )}
      </View>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.onSurface,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={value}
        onChangeText={setValue}
        {...props}
      />
      {value !== "" && (
        <Text
          style={[
            styles.clearText,
            {
              color: theme.colors.onSurfaceVariant,
            },
          ]}
          onPress={() => setValue("")}
          accessibilityLabel="Clear search"
        >
          ✕
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  iconLeft: {
    marginRight: 10,
  },
  searchIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "System",
    paddingVertical: 12,
  },
  clearText: {
    fontSize: 18,
    fontFamily: "System",
    marginLeft: 8,
    padding: 2,
  },
});
