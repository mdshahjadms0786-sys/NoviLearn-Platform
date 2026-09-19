"use client";

import { StyleSheet, Text, View } from "react-native";

import type { VisualLearning as VisualLearningData } from "@novilearn/types";

import { useTheme } from "../../theme-provider";
import { Card, CardContent, CardHeader } from "../ui/card";

interface VisualLearningProps {
  visual: VisualLearningData;
}

export function VisualLearning({ visual }: VisualLearningProps) {
  const { theme } = useTheme();
  const lastIndex = visual.nodes.length - 1;

  return (
    <Card>
      <CardHeader
        title={visual.title}
        subtitle="Flow shown in order from top to bottom."
      />
      <CardContent style={styles.content}>
        {visual.nodes.map((node, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.circle,
                  {
                    borderColor: theme.colors.outline,
                    backgroundColor: theme.colors.surfaceVariant,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              {index < lastIndex && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: theme.colors.outline },
                  ]}
                />
              )}
            </View>
            <View
              style={index < lastIndex ? styles.nodeBody : styles.nodeBodyLast}
            >
              <Text
                style={[styles.nodeLabel, { color: theme.colors.onSurface }]}
              >
                {node.label}
              </Text>
              {node.details !== undefined && (
                <Text
                  style={[
                    styles.nodeDetails,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {node.details}
                </Text>
              )}
            </View>
          </View>
        ))}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  rail: {
    alignItems: "center",
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginVertical: 4,
  },
  nodeBody: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 20,
  },
  nodeBodyLast: {
    flex: 1,
    paddingTop: 4,
  },
  nodeLabel: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "System",
  },
  nodeDetails: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
    fontFamily: "System",
  },
});
