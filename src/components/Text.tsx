import React from "react";
import { Text as RNText, TextStyle } from "react-native";
import { colors, typography, textStyles } from "../styles";

// Text component with typography variants
interface TextProps {
  children?: React.ReactNode;
  style?: TextStyle | TextStyle[];
  variant?: "h1" | "h2" | "h3" | "h4" | "bodyLarge" | "body" | "bodySmall" | "caption";
  color?: keyof typeof colors.text | string;
  center?: boolean;
  bold?: boolean;
}

export const Text = ({
  children,
  style,
  variant = "body",
  color,
  center = false,
  bold = false,
}: TextProps) => {
  const combinedStyles: TextStyle[] = [];

  // Add variant style
  if (variant && textStyles[variant]) {
    combinedStyles.push(textStyles[variant]);
  }

  // Add color
  if (color) {
    if (colors.text[color as keyof typeof colors.text]) {
      combinedStyles.push({ color: colors.text[color as keyof typeof colors.text] });
    } else {
      combinedStyles.push({ color });
    }
  }

  // Add alignment
  if (center) {
    combinedStyles.push({ textAlign: "center" });
  }

  // Add weight
  if (bold) {
    combinedStyles.push({ fontWeight: typography.fontWeight.bold });
  }

  if (style) {
    if (Array.isArray(style)) {
      combinedStyles.push(...style);
    } else {
      combinedStyles.push(style);
    }
  }

  return <RNText style={combinedStyles}>{children}</RNText>;
};
