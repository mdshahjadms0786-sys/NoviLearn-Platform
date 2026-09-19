'use client';

import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignSystemShowcase } from '../components/design-system-showcase';
import { AppShell } from '../components/layout/app-shell';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Divider } from '../components/ui/divider';
import { useAuthStore } from '../lib/auth-store';
import { useTheme } from '../theme-provider';

function ProfileContent() {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [signingOut, setSigningOut] = React.useState(false);
  const [showShowcase, setShowShowcase] = React.useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  };

  if (user === null) {
    return null;
  }

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .filter((char): char is string => char !== undefined)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={styles.content}>
      <View style={styles.header}>
        <View
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>
            {initials}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: theme.colors.onBackground }]}>
            {user.name}
          </Text>
          <Text
            style={[styles.email, { color: theme.colors.onSurfaceVariant }]}
          >
            {user.email}
          </Text>
        </View>
        <Badge>{user.role}</Badge>
      </View>

      <Divider />

      <Card>
        <CardHeader title="Membership" />
        <CardContent>
          <View style={styles.membershipRow}>
            <Text
              style={[
                styles.membershipLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Plan
            </Text>
            <Text
              style={[
                styles.membershipValue,
                { color: theme.colors.onSurface },
              ]}
            >
              Starter
            </Text>
          </View>
          <View style={styles.membershipRow}>
            <Text
              style={[
                styles.membershipLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Status
            </Text>
            <Text
              style={[
                styles.membershipValue,
                { color: theme.colors.onSurface },
              ]}
            >
              Free
            </Text>
          </View>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Learning profile" />
        <CardContent>
          <Text
            style={[
              styles.membershipLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Your learning preferences, goals, and interests will appear here in
            a future phase.
          </Text>
        </CardContent>
      </Card>

      <Button
        variant="outlined"
        size="lg"
        fullWidth
        icon={
          <Ionicons
            name="grid-outline"
            size={18}
            color={theme.colors.primary}
          />
        }
        onPress={() => setShowShowcase((prev) => !prev)}
      >
        {showShowcase ? 'Hide design system' : 'Browse design system'}
      </Button>

      {showShowcase && <DesignSystemShowcase />}

      <Divider />

      <Button
        variant="outlined"
        size="lg"
        fullWidth
        loading={signingOut}
        disabled={signingOut}
        onPress={() => {
          void handleSignOut();
        }}
      >
        Sign out
      </Button>
    </View>
  );
}

export default function AccountScreen() {
  return (
    <AppShell>
      <ProfileContent />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'System',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  email: {
    fontSize: 14,
    fontFamily: 'System',
    marginTop: 2,
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  membershipLabel: {
    fontSize: 14,
    fontFamily: 'System',
  },
  membershipValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});
