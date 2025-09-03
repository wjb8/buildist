import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import type { ReactNode } from "react";
import { buttonStyles, textStyles, colors } from "../styles";
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
    let baseStyle = { ...buttonStyles[variant] };

    if (disabled) {
      Object.assign(baseStyle, buttonStyles[`${variant}Disabled` as keyof typeof buttonStyles]);
    }

    if (fullWidth) {
      Object.assign(baseStyle, { width: "100%" });
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
