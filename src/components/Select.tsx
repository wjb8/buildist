import { useState } from "react";
import { Modal, Pressable, ScrollView, View as RNView } from "react-native";
import { View } from "./View";
import { Text } from "./Text";
import { Button } from "./Button";
import { Card } from "./Card";
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
      <Pressable disabled={disabled} onPress={() => setOpen(true)} style={[inputStyles.base]}>
        <Text variant="body">{selectedLabel || placeholder}</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <RNView
          style={{
            flex: 1,
            backgroundColor: colors.background.overlay,
            justifyContent: "flex-end",
          }}
        >
          <Card style={[layoutStyles.p3]}>
            <Text variant="h4" style={[layoutStyles.mb2]}>
              Choose an option
            </Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {options.map((opt) => (
                <View key={opt.value} style={[layoutStyles.mb2]}>
                  <Button
                    variant={opt.value === value ? "primary" : "secondary"}
                    onPress={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    size="small"
                    fullWidth
                  >
                    {opt.label}
                  </Button>
                </View>
              ))}
            </ScrollView>
            <View style={[layoutStyles.mt2]}>
              <Button variant="text" onPress={() => setOpen(false)} size="small">
                Cancel
              </Button>
            </View>
          </Card>
        </RNView>
      </Modal>
    </View>
  );
}
