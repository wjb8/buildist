import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import type { ReactNode } from "react";
import { buttonStyles, textStyles, colors, spacing } from "../styles";
import { Text } from "./Text";

// Button component
interface ButtonProps extends TouchableOpacityProps {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "text" | "danger";
  size?: "small" | "medium" | "large";
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
    let baseStyle = { ...buttonStyles[variant] } as any;

    if (disabled) {
      Object.assign(baseStyle, buttonStyles[`${variant}Disabled` as keyof typeof buttonStyles]);
    }

    if (fullWidth) {
      Object.assign(baseStyle, { width: "100%" });
    }

    // Size adjustments (reduce vertical height for small/medium)
    if (size === "small") {
      Object.assign(baseStyle, { paddingVertical: spacing.sm, minHeight: 40 });
    } else if (size === "medium") {
      Object.assign(baseStyle, { paddingVertical: spacing.sm + 4, minHeight: 44 });
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    let textStyle;
    switch (size) {
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
