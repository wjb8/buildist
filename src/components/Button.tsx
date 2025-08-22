import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import type { ReactNode } from "react";
import { buttonStyles, textStyles } from "../styles";
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
    switch (size) {
      case "small":
        return textStyles.buttonSmall;
      case "large":
        return textStyles.buttonLarge;
      default:
        return textStyles.button;
    }
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
