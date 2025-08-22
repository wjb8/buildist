import { View as RNView, ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { layoutStyles } from "../styles";

// View component with common layout utilities
interface ViewProps {
  children?: ReactNode;
  style?: ViewStyle | ViewStyle[];
  center?: boolean;
  row?: boolean;
  spaceBetween?: boolean;
  card?: boolean;
  section?: boolean;
}

export const View = ({
  children,
  style,
  center = false,
  row = false,
  spaceBetween = false,
  card = false,
  section = false,
}: ViewProps) => {
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

  return <RNView style={combinedStyles}>{children}</RNView>;
};
