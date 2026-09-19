'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { loginSchema } from '@novilearn/shared';
import type { LoginInput } from '@novilearn/types';

import { AuthScreen } from '../components/auth/auth-screen';
import { AuthFormField } from '../components/auth/form-field';
import { Button } from '../components/ui/button';
import { ApiClientError } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';
import { useTheme } from '../theme-provider';

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const status = useAuthStore((s) => s.status);
  const login = useAuthStore((s) => s.login);
  const restore = useAuthStore((s) => s.restore);
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  React.useEffect(() => {
    void restore();
  }, [restore]);

  React.useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [router, status]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await login(values);
      router.replace('/');
    } catch (error) {
      setServerError(
        error instanceof ApiClientError
          ? error.error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to continue your learning."
    >
      {serverError !== null && (
        <View
          style={[styles.alert, { backgroundColor: theme.colors.error + '14' }]}
        >
          <Text style={[styles.alertText, { color: theme.colors.error }]}>
            {serverError}
          </Text>
        </View>
      )}
      <View style={styles.fields}>
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
          placeholder="Your password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
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
        Sign in
      </Button>
      <TouchableOpacity
        style={styles.linkWrap}
        onPress={() => router.push('/signup')}
      >
        <Text style={[styles.link, { color: theme.colors.primary }]}>
          No account yet? Create one
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
    fontFamily: 'System',
  },
  fields: {
    gap: 16,
  },
  submit: {
    marginTop: 24,
  },
  linkWrap: {
    marginTop: 16,
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    fontFamily: 'System',
  },
});
