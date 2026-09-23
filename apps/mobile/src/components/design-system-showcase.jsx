"use client";

import * as React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme-provider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardHeader, CardContent, CardActions } from "./ui/card";
import { Screen, Section, Header } from "./ui/containers";
import { Divider } from "./ui/divider";
import { Input } from "./ui/input";
import { ModalComponent } from "./ui/modal";
import { Progress } from "./ui/progress";
import { SearchInput } from "./ui/search-input";
import { Skeleton } from "./ui/skeleton";
import { Spinner } from "./ui/spinner";
import { EmptyState, ErrorState, LoadingState } from "./ui/states";
export function DesignSystemShowcase() {
  const { theme, colorScheme, toggleTheme } = useTheme();
  const [modalVisible, setModalVisible] = React.useState(false);
  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Design System"
          subtitle={`NoviLearn UI · ${colorScheme === "dark" ? "Dark" : "Light"} theme`}
          action={
            <Button variant="outlined" size="sm" onPress={toggleTheme}>
              {colorScheme === "dark" ? "☀️" : "🌙"}
            </Button>
          }
        />

        <Section title="Buttons">
          <View style={styles.row}>
            <Button>Contained</Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="text">Text</Button>
          </View>
          <View style={styles.row}>
            <Button size="sm">Small</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </View>
        </Section>

        <Divider />

        <Section title="Inputs">
          <Input
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
          />
          <Input
            label="With hint"
            placeholder="Type something..."
            hint="This is a hint"
          />
          <Input
            label="Error state"
            placeholder="Invalid"
            error="This field is required"
          />
          <SearchInput placeholder="Search components..." />
        </Section>

        <Divider />

        <Section title="Badges">
          <View style={styles.row}>
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="outline">Outline</Badge>
          </View>
          <View style={styles.row}>
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </View>
        </Section>

        <Divider />

        <Section title="Cards">
          <Card>
            <CardHeader
              title="Card Title"
              subtitle="A card for displaying content"
            />
            <CardContent>
              <Text
                style={[
                  styles.cardText,
                  {
                    color: theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                Card content goes here. It can contain any elements.
              </Text>
            </CardContent>
            <CardActions>
              <Button size="sm" variant="text">
                Cancel
              </Button>
              <Button size="sm">Action</Button>
            </CardActions>
          </Card>
        </Section>

        <Divider />

        <Section title="Progress & Loading">
          <Progress value={45} showLabel />
          <Progress value={45} size="lg" />
          <View style={styles.row}>
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" />
          </View>
          <View style={styles.skeletonRow}>
            <Skeleton height={16} />
            <Skeleton height={16} width="75%" />
            <Skeleton height={64} />
          </View>
        </Section>

        <Divider />

        <Section title="States">
          <View style={styles.stateBox}>
            <EmptyState
              title="No courses yet"
              description="Start by creating your first course to begin learning."
              action={
                <Button size="sm" onPress={() => setModalVisible(true)}>
                  Create Course
                </Button>
              }
            />
          </View>
          <View style={styles.stateBox}>
            <ErrorState
              title="Failed to load"
              description="There was an error loading your data."
              action={
                <Button size="sm" variant="outlined">
                  Retry
                </Button>
              }
            />
          </View>
          <View style={styles.stateBox}>
            <LoadingState message="Loading your courses..." />
          </View>
        </Section>

        <Divider />

        <Section title="Modal">
          <Button variant="outlined" onPress={() => setModalVisible(true)}>
            Open Modal
          </Button>
        </Section>
      </ScrollView>

      <ModalComponent
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Create Course"
        size="md"
      >
        <Input label="Course name" placeholder="e.g. Advanced Physics" />
        <View style={styles.modalActions}>
          <Button variant="text" onPress={() => setModalVisible(false)}>
            Cancel
          </Button>
          <Button onPress={() => setModalVisible(false)}>Create</Button>
        </View>
      </ModalComponent>
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: {
    paddingBottom: 48,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  cardText: {
    fontSize: 14,
    fontFamily: "System",
    lineHeight: 20,
  },
  skeletonRow: {
    gap: 8,
    marginTop: 8,
  },
  stateBox: {
    minHeight: 180,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
});
export default function ShowcaseScreen() {
  return <DesignSystemShowcase />;
}
