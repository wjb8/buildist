import { View, ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { colors, spacing, borderRadius, layoutStyles } from "../styles";

// Card component
interface CardProps {
  children?: ReactNode;
  style?: ViewStyle | ViewStyle[];
  padding?: "small" | "medium" | "large";
  shadow?: "none" | "small" | "medium" | "large";
}

export const Card = ({ children, style, padding = "medium", shadow = "small" }: CardProps) => {
  const getPadding = () => {
    switch (padding) {
      case "small":
        return spacing.sm;
      case "large":
        return spacing.lg;
      default:
        return spacing.md;
    }
  };

  const getShadow = () => {
    switch (shadow) {
      case "none":
        return {};
      case "medium":
        return layoutStyles.shadowMd;
      case "large":
        return layoutStyles.shadowLg;
      default:
        return layoutStyles.shadowSm;
    }
  };

  const cardStyle: ViewStyle = {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: getPadding(),
    ...getShadow(),
  };

  return <View style={[cardStyle, style]}>{children}</View>;
};
