"use client";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

import { useTheme } from "../../theme-provider";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Screen } from "../ui/containers";
export function AuthScreen({ title, subtitle, children }) {
  const { theme } = useTheme();
  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.brand,
              {
                color: theme.colors.primary,
              },
            ]}
          >
            NoviLearn
          </Text>
          <Text
            style={[
              styles.tagline,
              {
                color: theme.colors.onSurfaceVariant,
              },
            ]}
          >
            AI-powered learning platform for students
          </Text>
          <Card style={styles.card}>
            <CardHeader title={title} subtitle={subtitle} />
            <CardContent>{children}</CardContent>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 32,
  },
  brand: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "System",
    textAlign: "center",
  },
  tagline: {
    fontSize: 14,
    fontFamily: "System",
    textAlign: "center",
    marginTop: 8,
  },
  card: {
    marginTop: 32,
  },
});
