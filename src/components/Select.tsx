import { useState } from "react";
import { Pressable, View as RNView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { View } from "./View";
import { Text } from "./Text";
import { colors, inputStyles, layoutStyles, spacing } from "@/styles";

interface OptionItem {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  options: OptionItem[];
  placeholder?: string;
  disabled?: boolean;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  disabled,
}: SelectProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <View>
      {label && <Text style={[inputStyles.label]}>{label}</Text>}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(!open)}
        style={[
          inputStyles.base,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: 40,
          },
        ]}
      >
        <Text variant="body" style={{ flex: 1, textAlign: "center" }}>
          {selectedLabel || placeholder}
        </Text>
        <MaterialIcons
          name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={20}
          color={colors.text.secondary}
        />
      </Pressable>

      {open && (
        <RNView
          style={[
            {
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1000,
              backgroundColor: colors.background.primary,
              borderWidth: 1,
              borderColor: colors.border.light,
              borderTopWidth: 0,
              borderBottomLeftRadius: spacing.sm,
              borderBottomRightRadius: spacing.sm,
              maxHeight: 200,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 5,
            },
          ]}
        >
          {options.map((opt, index) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              style={[
                {
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.md,
                  backgroundColor: opt.value === value ? colors.primary.light : "transparent",
                  borderBottomWidth: index < options.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border.light,
                },
              ]}
            >
              <Text
                variant="body"
                style={{
                  color: opt.value === value ? colors.primary.main : colors.text.primary,
                  textAlign: "center",
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </RNView>
      )}
    </View>
  );
}
