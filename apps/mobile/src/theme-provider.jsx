"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

import { colors } from "@novilearn/design-tokens";
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.brand.primary["500"],
    primaryContainer: colors.brand.primary["100"],
    secondary: colors.brand.secondary["500"],
    secondaryContainer: colors.brand.secondary["100"],
    surface: colors.neutral.white,
    surfaceVariant: colors.brand.secondary["50"],
    background: colors.neutral.white,
    error: colors.semantic.error.light,
    onPrimary: colors.neutral.white,
    onSecondary: colors.neutral.white,
    onSurface: colors.brand.secondary["900"],
    onSurfaceVariant: colors.brand.secondary["600"],
    onBackground: colors.brand.secondary["900"],
    onError: colors.neutral.white,
    outline: colors.brand.secondary["200"],
    outlineVariant: colors.brand.secondary["300"],
  },
};
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.brand.primary["400"],
    primaryContainer: "#1e3a5f",
    secondary: colors.brand.secondary["400"],
    secondaryContainer: colors.brand.secondary["700"],
    surface: colors.brand.secondary["800"],
    surfaceVariant: colors.brand.secondary["900"],
    background: colors.brand.secondary["900"],
    error: colors.semantic.error.dark,
    onPrimary: colors.brand.secondary["900"],
    onSecondary: colors.brand.secondary["900"],
    onSurface: colors.brand.secondary["50"],
    onSurfaceVariant: colors.brand.secondary["300"],
    onBackground: colors.brand.secondary["50"],
    onError: colors.brand.secondary["900"],
    outline: colors.brand.secondary["700"],
    outlineVariant: colors.brand.secondary["600"],
  },
};
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
  const [colorScheme, setColorScheme] = useState(() =>
    Appearance.getColorScheme(),
  );
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);
  const theme = useMemo(
    () => (colorScheme === "dark" ? darkTheme : lightTheme),
    [colorScheme],
  );
  const toggleTheme = () => {
    setColorScheme((prev) => (prev === "dark" ? "light" : "dark"));
  };
  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorScheme,
        toggleTheme,
        setColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
