import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  TextInputProps,
} from "react-native";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  layoutStyles,
  textStyles,
  buttonStyles,
  inputStyles,
} from "@styles";

// Styled View component with common layout utilities
interface StyledViewProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  center?: boolean;
  row?: boolean;
  spaceBetween?: boolean;
  card?: boolean;
  section?: boolean;
}

export const StyledView: React.FC<StyledViewProps> = ({
  children,
  style,
  center = false,
  row = false,
  spaceBetween = false,
  card = false,
  section = false,
}) => {
  const combinedStyles: ViewStyle[] = [];

  if (center) combinedStyles.push(layoutStyles.flexCenter);
  if (row) combinedStyles.push(layoutStyles.flexRow);
  if (spaceBetween) combinedStyles.push(layoutStyles.rowSpaceBetween);
  if (card) combinedStyles.push(layoutStyles.card);
  if (section) combinedStyles.push(layoutStyles.section);

  if (style) {
    if (Array.isArray(style)) {
      combinedStyles.push(...style);
    } else {
      combinedStyles.push(style);
    }
  }

  return <View style={combinedStyles}>{children}</View>;
};

// Styled Text component with typography variants
interface StyledTextProps {
  children?: React.ReactNode;
  style?: TextStyle | TextStyle[];
  variant?: "h1" | "h2" | "h3" | "h4" | "bodyLarge" | "body" | "bodySmall" | "caption";
  color?: keyof typeof colors.text | string;
  center?: boolean;
  bold?: boolean;
}

export const StyledText: React.FC<StyledTextProps> = ({
  children,
  style,
  variant = "body",
  color,
  center = false,
  bold = false,
}) => {
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

  return <Text style={combinedStyles}>{children}</Text>;
};

// Styled Button component
interface StyledButtonProps extends TouchableOpacityProps {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "text" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  fullWidth?: boolean;
}

export const StyledButton: React.FC<StyledButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  style,
  ...props
}) => {
  const getButtonStyle = () => {
    let baseStyle = buttonStyles[variant];

    if (disabled) {
      baseStyle = {
        ...baseStyle,
        ...buttonStyles[`${variant}Disabled` as keyof typeof buttonStyles],
      };
    }

    if (fullWidth) {
      baseStyle = { ...baseStyle, width: "100%" };
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
      {typeof children === "string" ? (
        <StyledText style={getTextStyle()}>{children}</StyledText>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

// Styled Input component
interface StyledInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const StyledInput: React.FC<StyledInputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  style,
  ...props
}) => {
  const inputStyle: ViewStyle[] = [inputStyles.base];

  if (fullWidth) {
    inputStyle.push({ width: "100%" });
  }

  if (error) {
    inputStyle.push(inputStyles.error);
  }

  if (style) {
    inputStyle.push(style);
  }

  return (
    <View style={fullWidth ? { width: "100%" } : undefined}>
      {label && (
        <StyledText style={inputStyles.label} variant="bodySmall">
          {label}
        </StyledText>
      )}
      <TextInput style={inputStyle} placeholderTextColor={colors.text.secondary} {...props} />
      {(error || helperText) && (
        <StyledText
          style={[inputStyles.helperText, error && { color: colors.error.main }]}
          variant="caption"
        >
          {error || helperText}
        </StyledText>
      )}
    </View>
  );
};

// Styled Card component
interface StyledCardProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padding?: "small" | "medium" | "large";
  shadow?: "none" | "small" | "medium" | "large";
}

export const StyledCard: React.FC<StyledCardProps> = ({
  children,
  style,
  padding = "medium",
  shadow = "small",
}) => {
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

// Styled Divider component
interface StyledDividerProps {
  style?: ViewStyle | ViewStyle[];
  vertical?: boolean;
  thickness?: number;
  color?: string;
  margin?: number;
}

export const StyledDivider: React.FC<StyledDividerProps> = ({
  style,
  vertical = false,
  thickness = 1,
  color = colors.border.light,
  margin = spacing.sm,
}) => {
  const dividerStyle: ViewStyle = {
    backgroundColor: color,
    marginVertical: vertical ? 0 : margin,
    marginHorizontal: vertical ? margin : 0,
  };

  if (vertical) {
    dividerStyle.width = thickness;
    dividerStyle.height = "100%";
  } else {
    dividerStyle.height = thickness;
    dividerStyle.width = "100%";
  }

  return <View style={[dividerStyle, style]} />;
};

// Styled Badge component
interface StyledBadgeProps {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "small" | "medium" | "large";
  style?: ViewStyle | ViewStyle[];
}

export const StyledBadge: React.FC<StyledBadgeProps> = ({
  children,
  variant = "primary",
  size = "medium",
  style,
}) => {
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
      <StyledText variant="caption" style={{ color: colors.text.primary }}>
        {children}
      </StyledText>
    </View>
  );
};

// Export all styled components
export {
  StyledView,
  StyledText,
  StyledButton,
  StyledInput,
  StyledCard,
  StyledDivider,
  StyledBadge,
};
