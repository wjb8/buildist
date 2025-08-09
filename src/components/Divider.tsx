import React from "react";
import { View, ViewStyle } from "react-native";
import { colors, spacing } from "../styles";

// Divider component
interface DividerProps {
  style?: ViewStyle | ViewStyle[];
  vertical?: boolean;
  thickness?: number;
  color?: string;
  margin?: number;
}

export const Divider = ({
  style,
  vertical = false,
  thickness = 1,
  color = colors.border.light,
  margin = spacing.sm,
}: DividerProps) => {
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
