import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Realm from "realm";
import { Vehicle } from "@/storage/models/assets/Vehicle";
import { getRealm } from "@/storage/realm";
import { AssetCondition } from "@/types/asset";
import { VehiclePriority } from "@/types/vehicle";
import { View } from "./View";
import { Text } from "./Text";
import { Input } from "./Input";
import Select from "./Select";
import { Button } from "./Button";
import { Card } from "./Card";
import { colors, spacing, layoutStyles } from "@/styles";

interface EditVehicleFormProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSaved?: () => void;
}

interface VehicleFormData {
  name: string;
  identifier: string;
  location: string;
  condition: AssetCondition;
  notes: string;
  qrTagId: string;
  mileage: string;
  hours: string;
  lastServiceDate: string; // ISO string for simplicity
  requiresService: string; // "yes" | "no"
  priority: VehiclePriority | "";
}

export default function EditVehicleForm({ vehicle, onClose, onSaved }: EditVehicleFormProps) {
  const [form, setForm] = useState<VehicleFormData>(() => ({
    name: vehicle.name,
    identifier: vehicle.identifier,
    location: vehicle.location ?? "",
    condition: vehicle.condition,
    notes: vehicle.notes ?? "",
    qrTagId: vehicle.qrTagId ?? "",
    mileage: vehicle.mileage != null ? String(vehicle.mileage) : "",
    hours: vehicle.hours != null ? String(vehicle.hours) : "",
    lastServiceDate: vehicle.lastServiceDate
      ? vehicle.lastServiceDate.toISOString().slice(0, 10)
      : "",
    requiresService: vehicle.requiresService ? "yes" : "no",
    priority: vehicle.priority ?? "",
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (key: keyof VehicleFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors([]);
  };

  const validate = (): boolean => {
    const next: string[] = [];
    if (!form.name.trim()) next.push("Vehicle name is required");
    if (!form.identifier.trim()) next.push("Identifier is required");
    if (form.mileage && parseFloat(form.mileage) < 0) next.push("Mileage must be >= 0");
    if (form.hours && parseFloat(form.hours) < 0) next.push("Hours must be >= 0");
    setErrors(next);
    return next.length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const realm = await getRealm();
      const now = new Date();
      const id = vehicle._id as unknown as Realm.BSON.ObjectId;
      realm.write(() => {
        const found = realm.objectForPrimaryKey<Vehicle>("Vehicle", id);
        if (!found) throw new Error("Vehicle not found");
        found.name = form.name.trim();
        found.identifier = form.identifier.trim();
        found.location = form.location.trim() || undefined;
        found.condition = form.condition;
        found.notes = form.notes.trim() || undefined;
        found.qrTagId = form.qrTagId.trim() || undefined;
        found.mileage = form.mileage ? parseFloat(form.mileage) : undefined;
        found.hours = form.hours ? parseFloat(form.hours) : undefined;
        found.lastServiceDate = form.lastServiceDate ? new Date(form.lastServiceDate) : undefined;
        found.requiresService =
          form.requiresService === "yes" ? true : form.requiresService === "no" ? false : undefined;
        found.priority = (form.priority || undefined) as VehiclePriority | undefined;
        found.updatedAt = now;
        found.synced = false;
      });
      Alert.alert("Success", "Vehicle updated.");
      onSaved?.();
      onClose();
    } catch (e) {
      console.error("Failed to update vehicle", e);
      Alert.alert("Error", "Could not update vehicle. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={spacing.xl}
      style={[layoutStyles.flex]}
    >
      <ScrollView style={[layoutStyles.flex]} keyboardShouldPersistTaps="handled">
        <Card style={[layoutStyles.p4]}>
          <Text variant="h3" style={[layoutStyles.mb4]}>
            Edit Vehicle
          </Text>

          {errors.length > 0 && (
            <View
              style={[
                layoutStyles.mb4,
                {
                  backgroundColor: colors.error.light,
                  padding: spacing.md,
                  borderRadius: spacing.sm,
                },
              ]}
            >
              {errors.map((e, i) => (
                <Text key={i} color="error" style={[layoutStyles.mb1]}>
                  • {e}
                </Text>
              ))}
            </View>
          )}

          <Input
            label="Vehicle Name *"
            value={form.name}
            onChangeText={(v) => handleChange("name", v)}
            placeholder="e.g., Snowplow Truck #3"
            style={[layoutStyles.mb3]}
          />

          <Input
            label="Identifier *"
            value={form.identifier}
            onChangeText={(v) => handleChange("identifier", v)}
            placeholder="Fleet identifier"
            style={[layoutStyles.mb3]}
          />

          <Input
            label="Location"
            value={form.location}
            onChangeText={(v) => handleChange("location", v)}
            placeholder="Where is it based?"
            style={[layoutStyles.mb3]}
          />

          <View style={[layoutStyles.mb3]}>
            <Select
              label="Condition *"
              value={form.condition}
              onChange={(v) => handleChange("condition", v)}
              options={[
                { value: AssetCondition.GOOD, label: "Good" },
                { value: AssetCondition.FAIR, label: "Fair" },
                { value: AssetCondition.POOR, label: "Poor" },
              ]}
            />
          </View>

          <View style={[layoutStyles.flexRow, layoutStyles.mb3]}>
            <View style={[layoutStyles.flex, layoutStyles.mr2]}>
              <Input
                label="Mileage"
                value={form.mileage}
                onChangeText={(v) => handleChange("mileage", v.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={[layoutStyles.flex]}>
              <Input
                label="Hours"
                value={form.hours}
                onChangeText={(v) => handleChange("hours", v.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="Last Service Date"
            value={form.lastServiceDate}
            onChangeText={(v) => handleChange("lastServiceDate", v)}
            placeholder="YYYY-MM-DD"
            style={[layoutStyles.mb3]}
          />

          <View style={[layoutStyles.flexRow, layoutStyles.mb3]}>
            <View style={[layoutStyles.flex, layoutStyles.mr2]}>
              <Select
                label="Requires Service?"
                value={form.requiresService}
                onChange={(v) => handleChange("requiresService", v)}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </View>
            <View style={[layoutStyles.flex]}>
              <Select
                label="Priority"
                value={form.priority}
                onChange={(v) => handleChange("priority", v)}
                options={[
                  { value: VehiclePriority.LOW, label: "Low" },
                  { value: VehiclePriority.MEDIUM, label: "Medium" },
                  { value: VehiclePriority.HIGH, label: "High" },
                ]}
              />
            </View>
          </View>

          <Input
            label="QR Tag ID"
            value={form.qrTagId}
            onChangeText={(v) => handleChange("qrTagId", v)}
            placeholder="e.g. VEH-xyz"
            style={[layoutStyles.mb3]}
          />

          <Input
            label="Notes"
            value={form.notes}
            onChangeText={(v) => handleChange("notes", v)}
            placeholder="Additional notes"
            multiline
            numberOfLines={3}
            style={[layoutStyles.mb4]}
          />

          <View row style={[layoutStyles.rowSpaceBetween]}>
            <Button variant="secondary" onPress={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onPress={handleSave} style={[layoutStyles.ml2]}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

