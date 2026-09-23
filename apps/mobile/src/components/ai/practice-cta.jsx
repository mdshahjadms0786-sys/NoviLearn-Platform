"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "../../theme-provider";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
export function PracticeCta({ topic }) {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <Card>
      <CardHeader
        title="Ready to test what you learned?"
        subtitle="Reinforce the topic with a short interactive practice session."
      />
      <CardContent>
        <Button
          fullWidth
          icon={
            <Ionicons name="fitness" size={16} color={theme.colors.onPrimary} />
          }
          onPress={() =>
            router.push(`/practice?topic=${encodeURIComponent(topic)}`)
          }
        >
          Practice This Topic
        </Button>
      </CardContent>
    </Card>
  );
}
