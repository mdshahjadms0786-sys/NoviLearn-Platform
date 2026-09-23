"use client";

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

import { useTheme } from "../../theme-provider";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
export function QuestionForm({
  headerTitle,
  headerSubtitle,
  fieldLabel,
  placeholder,
  buttonLabel,
  question,
  onChangeText,
  onSubmit,
  disabled,
  canSubmit,
  loading,
}) {
  const { theme } = useTheme();
  return (
    <Card>
      <CardHeader title={headerTitle} subtitle={headerSubtitle} />
      <CardContent style={styles.content}>
        <Input
          label={fieldLabel}
          value={question}
          onChangeText={onChangeText}
          placeholder={placeholder}
          autoCorrect={false}
          autoCapitalize="sentences"
          returnKeyType="send"
          onSubmitEditing={() => {
            if (canSubmit) {
              onSubmit();
            }
          }}
          editable={!disabled}
        />
        <Button
          fullWidth
          disabled={!canSubmit}
          loading={loading}
          icon={
            <Ionicons
              name="sparkles"
              size={16}
              color={theme.colors.onPrimary}
            />
          }
          onPress={onSubmit}
        >
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
});
