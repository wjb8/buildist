import { StyleSheet, TouchableOpacity, TouchableOpacityProps, ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { buttonStyles, textStyles, colors, spacing } from "../styles";
import { Text } from "./Text";

// Button component
interface ButtonProps extends TouchableOpacityProps {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "text" | "danger";
  size?: "xsmall" | "small" | "medium" | "large";
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  style,
  ...props
}: ButtonProps) => {
  const getButtonStyle = () => {
    const flattened = StyleSheet.flatten(buttonStyles[variant]) as ViewStyle | undefined;
    let baseStyle: ViewStyle = { ...(flattened ?? {}) };

    if (disabled) {
      Object.assign(baseStyle, buttonStyles[`${variant}Disabled` as keyof typeof buttonStyles]);
    }

    if (fullWidth) {
      Object.assign(baseStyle, { width: "100%" });
    }

    // Size adjustments (compact footprint)
    if (size === "xsmall") {
      Object.assign(baseStyle, {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        minHeight: 32,
      });
    } else if (size === "small") {
      Object.assign(baseStyle, {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        minHeight: 36,
      });
    } else if (size === "medium") {
      Object.assign(baseStyle, { paddingVertical: spacing.sm, minHeight: 44 });
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    let textStyle;
    switch (size) {
      case "xsmall":
        textStyle = textStyles.buttonSmall;
        break;
      case "small":
        textStyle = textStyles.buttonSmall;
        break;
      case "large":
        textStyle = textStyles.buttonLarge;
        break;
      default:
        textStyle = textStyles.button;
    }

    // For secondary buttons, override the text color to be visible on white background
    if (variant === "secondary") {
      return { ...textStyle, color: colors.primary.main };
    }

    return textStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      {typeof children === "string" ? <Text style={getTextStyle()}>{children}</Text> : children}
    </TouchableOpacity>
  );
};
