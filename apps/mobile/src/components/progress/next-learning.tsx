import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import type { NextLearningSuggestion, SuggestionKind } from "@novilearn/types";

import { useTheme } from "../../theme-provider";
import { DashboardEmpty } from "../dashboard/dashboard-empty";
import { DashboardSection } from "../dashboard/dashboard-section";
import { Button } from "../ui/button";

function hrefForSuggestion(kind: SuggestionKind, topic: string): Href {
  const encoded = encodeURIComponent(topic);
  return kind === "practice_again"
    ? `/practice?topic=${encoded}`
    : `/learn?q=${encoded}`;
}

interface NextLearningProps {
  suggestions: NextLearningSuggestion[];
}

export function NextLearning({ suggestions }: NextLearningProps) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <DashboardSection
      title="Suggested next"
      description="Deterministic suggestions built from your real progress."
    >
      {suggestions.length === 0 ? (
        <DashboardEmpty
          icon={
            <Ionicons
              name="sparkles-outline"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          }
          title="No suggestions yet"
          description="Learn or practice a topic and we will suggest what to do next."
          action={
            <Button onPress={() => router.push("/learn")}>
              Start learning
            </Button>
          }
        />
      ) : (
        <View style={styles.list}>
          {suggestions.map((suggestion) => (
            <View
              key={suggestion.kind}
              style={[styles.card, { borderColor: theme.colors.outline }]}
            >
              <View style={styles.textBlock}>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                  {suggestion.title}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.description,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {suggestion.description}
                </Text>
              </View>
              <Button
                variant="outlined"
                size="sm"
                onPress={() => {
                  router.push(
                    hrefForSuggestion(suggestion.kind, suggestion.topic),
                  );
                }}
              >
                Go
              </Button>
            </View>
          ))}
        </View>
      )}
    </DashboardSection>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
  description: {
    fontSize: 13,
    fontFamily: "System",
    lineHeight: 18,
  },
});
