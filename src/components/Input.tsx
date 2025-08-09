import React from "react";
import { View, TextInput, TextInputProps, ViewStyle, TextStyle } from "react-native";
import { colors, inputStyles } from "../styles";
import { Text } from "./Text";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = ({
  label,
  error,
  helperText,
  fullWidth = false,
  style,
  ...props
}: InputProps) => {
  const inputStyle: (ViewStyle | TextStyle)[] = [inputStyles.base];

  if (fullWidth) {
    inputStyle.push({ width: "100%" });
  }

  if (error) {
    inputStyle.push(inputStyles.error);
  }

  if (style) {
    if (Array.isArray(style)) {
      inputStyle.push(...(style.filter(Boolean) as (ViewStyle | TextStyle)[]));
    } else {
      inputStyle.push(style as ViewStyle | TextStyle);
    }
  }

  return (
    <View style={fullWidth ? { width: "100%" } : undefined}>
      {label && (
        <Text style={inputStyles.label} variant="bodySmall">
          {label}
        </Text>
      )}
      <TextInput style={inputStyle} placeholderTextColor={colors.text.secondary} {...props} />
      {(error || helperText) && (
        <Text
          style={[inputStyles.helperText, error ? { color: colors.error.main } : {}]}
          variant="caption"
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};
