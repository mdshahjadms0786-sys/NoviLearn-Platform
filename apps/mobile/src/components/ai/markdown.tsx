"use client";

import * as React from "react";
import { StyleSheet, Text, TextStyle, View } from "react-native";

import { useTheme } from "../../theme-provider";

interface InlineSegmentsProps {
  text: string;
  style: TextStyle | TextStyle[];
}

function InlineSegments({ text, style }: InlineSegmentsProps) {
  const { theme } = useTheme();
  const segments = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return (
    <React.Fragment>
      {segments.map((segment, index) => {
        if (segment.startsWith("**") && segment.endsWith("**")) {
          return (
            <Text key={index} style={[style, { fontWeight: "700" }]}>
              {segment.slice(2, -2)}
            </Text>
          );
        }
        if (segment.startsWith("`") && segment.endsWith("`")) {
          return (
            <Text
              key={index}
              style={[
                style,
                styles.code,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              {segment.slice(1, -1)}
            </Text>
          );
        }
        return (
          <Text key={index} style={style}>
            {segment}
          </Text>
        );
      })}
    </React.Fragment>
  );
}

type Block =
  | { kind: "paragraph"; lines: string[] }
  | { kind: "list"; ordered: boolean; lines: string[] };

function parseBlocks(text: string): Block[] {
  const rawLines = text.split(/\r?\n/);
  const blocks: Block[] = [];
  let current: Block | null = null;

  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (line === "") {
      current = null;
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet !== null && bullet[1] !== undefined) {
      if (current === null || current.kind !== "list" || current.ordered) {
        current = { kind: "list", ordered: false, lines: [bullet[1]] };
        blocks.push(current);
      } else {
        current.lines.push(bullet[1]);
      }
      continue;
    }

    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (numbered !== null && numbered[1] !== undefined) {
      if (current === null || current.kind !== "list" || !current.ordered) {
        current = { kind: "list", ordered: true, lines: [numbered[1]] };
        blocks.push(current);
      } else {
        current.lines.push(numbered[1]);
      }
      continue;
    }

    if (current === null || current.kind !== "paragraph") {
      current = { kind: "paragraph", lines: [line] };
      blocks.push(current);
    } else {
      current.lines.push(line);
    }
  }

  return blocks;
}

interface MarkdownTextProps {
  text: string;
  style?: TextStyle;
}

export function MarkdownText({ text, style }: MarkdownTextProps) {
  const { theme } = useTheme();
  const blocks = parseBlocks(text);

  return (
    <View style={styles.container}>
      {blocks.map((block, index) => {
        const bodyStyle: TextStyle[] = [
          styles.body,
          { color: theme.colors.onSurface },
          ...(style !== undefined ? [style] : []),
        ];

        if (block.kind === "list") {
          return (
            <View key={index} style={styles.list}>
              {block.lines.map((line, lineIndex) => (
                <View key={lineIndex} style={styles.listRow}>
                  <Text
                    style={[
                      styles.bullet,
                      { color: theme.colors.primary },
                      style,
                    ]}
                  >
                    {block.ordered ? `${lineIndex + 1}.` : "•"}
                  </Text>
                  <View style={styles.listItem}>
                    <InlineSegments text={line} style={bodyStyle} />
                  </View>
                </View>
              ))}
            </View>
          );
        }

        return (
          <Text key={index} style={bodyStyle}>
            <InlineSegments text={block.lines.join("\n")} style={bodyStyle} />
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "System",
  },
  code: {
    fontFamily: "monospace",
    fontSize: 13,
    borderRadius: 4,
    paddingHorizontal: 4,
    overflow: "hidden",
  },
  list: {
    gap: 4,
  },
  listRow: {
    flexDirection: "row",
    gap: 8,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "System",
  },
  listItem: {
    flex: 1,
  },
});
