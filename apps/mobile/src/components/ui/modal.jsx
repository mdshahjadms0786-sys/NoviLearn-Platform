"use client";

import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../theme-provider";
const sizeStyles = {
  sm: {
    width: "80%",
    maxWidth: 320,
  },
  md: {
    width: "90%",
    maxWidth: 400,
  },
  lg: {
    width: "95%",
    maxWidth: 500,
  },
  full: {
    width: "100%",
    maxWidth: "100%",
  },
};
export function ModalComponent({
  visible,
  onClose,
  children,
  title,
  size = "md",
  closeOnOverlayPress = true,
  style,
}) {
  const { theme } = useTheme();
  const sizes = sizeStyles[size];
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={closeOnOverlayPress ? onClose : undefined}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surface,
              width: sizes.width,
              maxWidth: sizes.maxWidth,
            },
            style,
          ]}
        >
          {title && (
            <View
              style={[
                styles.header,
                {
                  borderBottomColor: theme.colors.outline,
                },
              ]}
            >
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.colors.onSurface,
                  },
                ]}
              >
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                accessibilityLabel="Close"
              >
                <Text
                  style={[
                    styles.closeText,
                    {
                      color: theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  ✕
                </Text>
              </Pressable>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </View>
      </Pressable>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    borderRadius: 16,
    maxHeight: "90%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "System",
  },
  closeText: {
    fontSize: 20,
    fontFamily: "System",
  },
  content: {
    padding: 16,
  },
});
