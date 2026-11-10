"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as React from "react";
import { useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { signupSchema } from "@novilearn/shared";

import { AuthScreen } from "../components/auth/auth-screen";
import { AuthFormField } from "../components/auth/form-field";
import { Button } from "../components/ui/button";
import { ApiClientError } from "../lib/api";
import { useAuthStore } from "../lib/auth-store";
import { useTheme } from "../theme-provider";
export default function SignupScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const status = useAuthStore((s) => s.status);
  const signup = useAuthStore((s) => s.signup);
  const restore = useAuthStore((s) => s.restore);
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState(null);
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  React.useEffect(() => {
    void restore();
  }, [restore]);
  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);
  const passwordValue = form.watch("password");
  const passwordStrength = React.useMemo(() => {
    if (!passwordValue)
      return { level: 0, label: "", color: theme.colors.outline };
    let score = 0;
    if (passwordValue.length >= 8) score++;
    if (passwordValue.length >= 12) score++;
    if (/[A-Z]/.test(passwordValue)) score++;
    if (/[a-z]/.test(passwordValue)) score++;
    if (/[0-9]/.test(passwordValue)) score++;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score++;
    if (score <= 2)
      return { level: 1, label: "Weak", color: theme.colors.error };
    if (score <= 4)
      return { level: 2, label: "Medium", color: theme.colors.warning.light };
    return { level: 3, label: "Strong", color: theme.colors.success.light };
  }, [passwordValue, theme]);
  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await signup(values);
      router.replace("/");
    } catch (error) {
      setServerError(
        error instanceof ApiClientError
          ? error.error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  });
  return (
    <AuthScreen
      title="Create your account"
      subtitle="Start your personalized learning journey."
    >
      {serverError !== null && (
        <View
          style={[
            styles.alert,
            {
              backgroundColor: theme.colors.error + "14",
            },
          ]}
        >
          <Text
            style={[
              styles.alertText,
              {
                color: theme.colors.error,
              },
            ]}
          >
            {serverError}
          </Text>
        </View>
      )}
      <View style={styles.fields}>
        <AuthFormField
          name="name"
          control={form.control}
          label="Name"
          placeholder="Your name"
          autoCapitalize="words"
          autoComplete="name"
        />
        <AuthFormField
          name="email"
          control={form.control}
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <AuthFormField
          name="password"
          control={form.control}
          label="Password"
          placeholder="At least 8 characters"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          showPasswordToggle
        />
        {passwordValue && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBars}>
              {[1, 2, 3].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor:
                        level <= passwordStrength.level
                          ? passwordStrength.color
                          : theme.colors.outlineVariant,
                    },
                  ]}
                />
              ))}
            </View>
            <Text
              style={[
                styles.strengthLabel,
                {
                  color: passwordStrength.color,
                },
              ]}
            >
              {passwordStrength.label}
              {passwordStrength.level === 1 && (
                <Text style={{ fontWeight: "600" }}>
                  {" "}
                  — Please use a stronger password.
                </Text>
              )}
            </Text>
          </View>
        )}
        <AuthFormField
          name="confirmPassword"
          control={form.control}
          label="Confirm password"
          placeholder="Repeat your password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          showPasswordToggle
        />
      </View>
      <Button
        size="lg"
        fullWidth
        loading={submitting}
        disabled={submitting}
        style={styles.submit}
        onPress={onSubmit}
      >
        Create account
      </Button>
      <TouchableOpacity
        style={styles.linkWrap}
        onPress={() => router.push("/login")}
      >
        <Text
          style={[
            styles.link,
            {
              color: theme.colors.primary,
            },
          ]}
        >
          Already have an account? Sign in
        </Text>
      </TouchableOpacity>
    </AuthScreen>
  );
}
const styles = StyleSheet.create({
  alert: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  alertText: {
    fontSize: 14,
    fontFamily: "System",
  },
  fields: {
    gap: 16,
  },
  strengthContainer: {
    marginTop: -8,
    marginBottom: 4,
    gap: 6,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontFamily: "System",
  },
  submit: {
    marginTop: 24,
  },
  linkWrap: {
    marginTop: 16,
    alignItems: "center",
  },
  link: {
    fontSize: 14,
    fontFamily: "System",
  },
});
