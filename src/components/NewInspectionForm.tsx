import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardTypeOptions,
  Switch,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Realm from "realm";
import { getRealm } from "@/storage/realm";
import { View } from "./View";
import { Text } from "./Text";
import { Input } from "./Input";
import { Button } from "./Button";
import { Card } from "./Card";
import { colors, layoutStyles, spacing, inputStyles } from "@/styles";

interface NewInspectionFormProps {
  assetId: string;
  onCreated?: () => void;
}

interface FormState {
  inspector: string;
  description: string;
  score: string; // store as string in input, convert to number on save
  maintenanceNeeded: boolean;
  nextDue: Date | null;
  showDatePicker?: boolean;
}

const initialState: FormState = {
  inspector: "",
  description: "",
  score: "",
  maintenanceNeeded: false,
  nextDue: null,
  showDatePicker: false,
};

export default function NewInspectionForm({ assetId, onCreated }: NewInspectionFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualEditedMaintenance, setManualEditedMaintenance] = useState(false);

  // Auto-calc maintenanceNeeded from score<=2 unless manually edited
  useEffect(() => {
    if (manualEditedMaintenance) return;
    const scoreNum = parseInt(form.score, 10);
    if (!isNaN(scoreNum)) {
      setForm((prev) => ({ ...prev, maintenanceNeeded: scoreNum <= 2 }));
    }
  }, [form.score, manualEditedMaintenance]);

  const handleChange = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors([]);
  };

  const validate = (): boolean => {
    const nextErrors: string[] = [];
    if (!assetId) nextErrors.push("Missing asset reference");
    if (!form.inspector.trim()) nextErrors.push("Inspector is required");
    const scoreNum = parseInt(form.score, 10);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 5) nextErrors.push("Score must be 1–5");
    // nextDue optional; no further validation needed
    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const realm = await getRealm();
      const now = new Date();
      const scoreNum = parseInt(form.score, 10);

      realm.write(() => {
        realm.create("Inspection", {
          _id: new Realm.BSON.ObjectId(),
          assetId,
          inspector: form.inspector.trim(),
          description: form.description.trim(),
          score: scoreNum,
          timestamp: now,
          maintenanceNeeded: form.maintenanceNeeded,
          nextDue: form.nextDue ?? undefined,
          createdAt: now,
          updatedAt: now,
          synced: false,
        });
      });

      Alert.alert("Success", "Inspection recorded.");
      setForm(initialState);
      setManualEditedMaintenance(false);
      onCreated?.();
    } catch (error) {
      console.error("Failed to create inspection:", error);
      Alert.alert("Error", "Could not create inspection. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[layoutStyles.flex]}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: spacing.xl * 3 }}
    >
      <Card style={[layoutStyles.p3, layoutStyles.mt2]}>
        <Text variant="h4" style={[layoutStyles.mb3]}>
          New Inspection
        </Text>

        {errors.length > 0 && (
          <View
            style={[
              layoutStyles.mb3,
              {
                backgroundColor: colors.error.light,
                padding: spacing.sm,
                borderRadius: spacing.sm,
              },
            ]}
          >
            {errors.map((e, i) => (
              <Text key={i} variant="bodySmall" color="error">
                • {e}
              </Text>
            ))}
          </View>
        )}

        <Input
          label="Inspector *"
          value={form.inspector}
          onChangeText={(v) => handleChange("inspector", v)}
          placeholder="e.g., J. Smith"
          style={[layoutStyles.mb3]}
        />

        <Input
          label="Condition Score (1–5) *"
          value={form.score}
          onChangeText={(v) => handleChange("score", v.replace(/[^0-9]/g, ""))}
          placeholder="1 to 5"
          keyboardType={"number-pad" as KeyboardTypeOptions}
          style={[layoutStyles.mb3]}
        />

        <Input
          label="Notes"
          value={form.description}
          onChangeText={(v) => handleChange("description", v)}
          placeholder="Optional notes"
          multiline
          style={[layoutStyles.mb3]}
        />

        <View
          row
          style={[layoutStyles.mb3, layoutStyles.rowCenter, { justifyContent: "space-between" }]}
        >
          <Text variant="body">Maintenance Needed</Text>
          <Switch
            value={form.maintenanceNeeded}
            onValueChange={(v) => {
              setManualEditedMaintenance(true);
              setForm((prev) => ({ ...prev, maintenanceNeeded: v }));
            }}
            thumbColor={form.maintenanceNeeded ? colors.success.main : colors.border.medium}
            trackColor={{ true: colors.success.light, false: colors.border.medium }}
          />
        </View>

        <View style={[layoutStyles.mb3]}>
          <Text variant="bodySmall" style={[layoutStyles.mb1]}>
            Next Due (optional)
          </Text>
          <Pressable
            onPress={() => handleChange("showDatePicker", true)}
            style={[inputStyles.base]}
          >
            <Text variant="body">
              {form.nextDue ? form.nextDue.toISOString().slice(0, 10) : "Select date"}
            </Text>
          </Pressable>

          {form.showDatePicker && (
            <DateTimePicker
              value={form.nextDue ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                if (Platform.OS !== "ios") handleChange("showDatePicker", false);
                if (date) handleChange("nextDue", date);
              }}
            />
          )}

          {form.nextDue && (
            <View style={[layoutStyles.mt2, { alignItems: "flex-end" }]}>
              <Button
                variant="secondary"
                size="small"
                onPress={() => handleChange("nextDue", null)}
              >
                Clear date
              </Button>
            </View>
          )}
        </View>

        <View row style={[layoutStyles.rowSpaceBetween]}>
          <Button
            variant="secondary"
            onPress={() => {
              setForm(initialState);
              setManualEditedMaintenance(false);
            }}
          >
            Reset
          </Button>
          <Button variant="primary" onPress={handleSubmit} style={[layoutStyles.ml2]}>
            {isSubmitting ? "Saving..." : "Save Inspection"}
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
}
