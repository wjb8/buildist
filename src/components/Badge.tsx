import { View, ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { colors, spacing, borderRadius } from "../styles";
import { Text } from "./Text";

// Badge component
interface BadgeProps {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "small" | "medium" | "large";
  style?: ViewStyle | ViewStyle[];
}

export const Badge = ({ children, variant = "primary", size = "medium", style }: BadgeProps) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: colors.neutral.lighter,
          borderColor: colors.neutral.mediumLight,
          borderWidth: 1,
        };
      case "success":
        return { backgroundColor: colors.success.lighter };
      case "warning":
        return { backgroundColor: colors.warning.lighter };
      case "error":
        return { backgroundColor: colors.error.lighter };
      default:
        return { backgroundColor: colors.primary.lighter };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return {
          paddingHorizontal: spacing.xs,
          paddingVertical: 2,
          borderRadius: borderRadius.sm,
        };
      case "large":
        return {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: borderRadius.md,
        };
      default:
        return {
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          borderRadius: borderRadius.sm,
        };
    }
  };

  const badgeStyle: ViewStyle = {
    ...getVariantStyle(),
    ...getSizeStyle(),
    alignSelf: "flex-start",
  };

  return (
    <View style={[badgeStyle, style]}>
      <Text variant="caption" style={{ color: colors.text.primary }}>
        {children}
      </Text>
    </View>
  );
};
