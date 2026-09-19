'use client';

import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme-provider';

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DashboardSection({
  title,
  description,
  children,
}: DashboardSectionProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View
        style={[styles.header, { borderBottomColor: theme.colors.outline }]}
      >
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        {description && (
          <Text
            style={[
              styles.description,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  description: {
    fontSize: 14,
    fontFamily: 'System',
    marginTop: 2,
  },
  content: {
    gap: 12,
  },
});
