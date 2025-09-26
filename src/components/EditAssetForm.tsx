import { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Realm from "realm";
import { Road } from "@/storage/models/assets/Road";
import { getRealm } from "@/storage/realm";
import { AssetCondition } from "@/types/asset";
import { RoadSurfaceType, TrafficVolume } from "@/types/road";
import { View } from "./View";
import { Text } from "./Text";
import { Input } from "./Input";
import Select from "./Select";
import { Button } from "./Button";
import { Card } from "./Card";
import { colors, spacing, layoutStyles } from "@/styles";

interface EditAssetFormProps {
  road: Road;
  onClose: () => void;
  onSaved?: () => void;
}

interface FormData {
  name: string;
  location: string;
  condition: AssetCondition;
  notes: string;
  qrTagId: string;
  surfaceType: RoadSurfaceType;
  trafficVolume: TrafficVolume;
  length: string;
  width: string;
  lanes: string;
  speedLimit: string;
}

export default function EditAssetForm({ road, onClose, onSaved }: EditAssetFormProps) {
  const [form, setForm] = useState<FormData>(() => ({
    name: road.name,
    location: road.location ?? "",
    condition: road.condition,
    notes: road.notes ?? "",
    qrTagId: road.qrTagId ?? "",
    surfaceType: road.surfaceType,
    trafficVolume: road.trafficVolume,
    length: road.length != null ? String(road.length) : "",
    width: road.width != null ? String(road.width) : "",
    lanes: road.lanes != null ? String(road.lanes) : "",
    speedLimit: road.speedLimit != null ? String(road.speedLimit) : "",
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors([]);
  };

  const validate = (): boolean => {
    const next: string[] = [];
    if (!form.name.trim()) next.push("Road name is required");
    if (form.length && parseFloat(form.length) <= 0) next.push("Length must be positive");
    if (form.width && parseFloat(form.width) <= 0) next.push("Width must be positive");
    if (form.lanes && parseInt(form.lanes) <= 0) next.push("Number of lanes must be positive");
    if (form.speedLimit && parseInt(form.speedLimit) <= 0)
      next.push("Speed limit must be positive");
    setErrors(next);
    return next.length === 0;
  };

  const renderEnumSelect = (
    field: keyof FormData,
    enumValues: Record<string, string>,
    label: string,
    required: boolean = false
  ) => (
    <View style={[layoutStyles.mb3]}>
      <Select
        label={`${label} ${required ? "*" : ""}`.trim()}
        value={String(form[field])}
        onChange={(val) => handleChange(field, val)}
        options={Object.entries(enumValues).map(([key, value]) => ({ value: key, label: value }))}
      />
    </View>
  );

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const realm = await getRealm();
      const now = new Date();
      const id = road._id as unknown as Realm.BSON.ObjectId;
      realm.write(() => {
        const found = realm.objectForPrimaryKey<Road>("Road", id);
        if (!found) throw new Error("Asset not found");
        found.name = form.name.trim();
        found.location = form.location.trim() || undefined;
        found.condition = form.condition;
        found.notes = form.notes.trim() || undefined;
        found.qrTagId = form.qrTagId.trim() || undefined;
        found.surfaceType = form.surfaceType;
        found.trafficVolume = form.trafficVolume;
        found.length = form.length ? parseFloat(form.length) : undefined;
        found.width = form.width ? parseFloat(form.width) : undefined;
        found.lanes = form.lanes ? parseInt(form.lanes, 10) : undefined;
        found.speedLimit = form.speedLimit ? parseInt(form.speedLimit, 10) : undefined;
        found.updatedAt = now;
        found.synced = false;
      });
      Alert.alert("Success", "Asset updated.");
      onSaved?.();
      onClose();
    } catch (e) {
      console.error("Failed to update asset", e);
      Alert.alert("Error", "Could not update asset. Please try again.");
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
            Edit Road Asset
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
            label="Road Name *"
            value={form.name}
            onChangeText={(v) => handleChange("name", v)}
            placeholder="Enter road name"
            style={[layoutStyles.mb3]}
          />

          <Input
            label="Location"
            value={form.location}
            onChangeText={(v) => handleChange("location", v)}
            placeholder="Enter road location"
            style={[layoutStyles.mb3]}
          />

          {renderEnumSelect(
            "condition",
            {
              [AssetCondition.EXCELLENT]: "Excellent",
              [AssetCondition.GOOD]: "Good",
              [AssetCondition.FAIR]: "Fair",
              [AssetCondition.POOR]: "Poor",
              [AssetCondition.CRITICAL]: "Critical",
            },
            "Condition *",
            true
          )}

          {renderEnumSelect(
            "surfaceType",
            {
              [RoadSurfaceType.ASPHALT]: "Asphalt",
              [RoadSurfaceType.CONCRETE]: "Concrete",
              [RoadSurfaceType.GRAVEL]: "Gravel",
              [RoadSurfaceType.DIRT]: "Dirt",
              [RoadSurfaceType.PAVER]: "Paver",
              [RoadSurfaceType.OTHER]: "Other",
            },
            "Surface Type *",
            true
          )}

          {renderEnumSelect(
            "trafficVolume",
            {
              [TrafficVolume.LOW]: "Low",
              [TrafficVolume.MEDIUM]: "Medium",
              [TrafficVolume.HIGH]: "High",
              [TrafficVolume.VERY_HIGH]: "Very High",
            },
            "Traffic Volume *",
            true
          )}

          <View style={[layoutStyles.flexRow, layoutStyles.mb3]}>
            <View style={[layoutStyles.flex, layoutStyles.mr2]}>
              <Input
                label="Length (m)"
                value={form.length}
                onChangeText={(v) => handleChange("length", v)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={[layoutStyles.flex]}>
              <Input
                label="Width (m)"
                value={form.width}
                onChangeText={(v) => handleChange("width", v)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[layoutStyles.flexRow, layoutStyles.mb3]}>
            <View style={[layoutStyles.flex, layoutStyles.mr2]}>
              <Input
                label="Lanes"
                value={form.lanes}
                onChangeText={(v) => handleChange("lanes", v)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={[layoutStyles.flex]}>
              <Input
                label="Speed Limit (km/h)"
                value={form.speedLimit}
                onChangeText={(v) => handleChange("speedLimit", v)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="QR Tag ID"
            value={form.qrTagId}
            onChangeText={(v) => handleChange("qrTagId", v)}
            placeholder="e.g. ROA-xyz"
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
