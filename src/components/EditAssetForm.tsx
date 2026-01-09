import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Realm from "realm";
import { Asset } from "@/storage/models/assets/Asset";
import { getRealm } from "@/storage/realm";
import { AssetCondition, AssetType } from "@/types/asset";
import { View } from "./View";
import { Text } from "./Text";
import { Input } from "./Input";
import Select from "./Select";
import { Button } from "./Button";
import { Card } from "./Card";
import { colors, spacing, layoutStyles } from "@/styles";

interface EditAssetFormProps {
  asset: Asset;
  onClose: () => void;
  onSaved?: () => void;
}

interface FormData {
  type: AssetType;
  name: string;
  location: string;
  condition: AssetCondition;
  notes: string;
  qrTagId: string;
}

const assetTypeOptions = [
  { value: AssetType.ROAD, label: "Road" },
  { value: AssetType.VEHICLE, label: "Vehicle" },
  { value: AssetType.BRIDGE, label: "Bridge" },
  { value: AssetType.SIDEWALK, label: "Sidewalk" },
  { value: AssetType.STREET_LIGHT, label: "Street Light" },
  { value: AssetType.TRAFFIC_SIGNAL, label: "Traffic Signal" },
  { value: AssetType.OTHER, label: "Other" },
];

export default function EditAssetForm({ asset, onClose, onSaved }: EditAssetFormProps) {
  const [form, setForm] = useState<FormData>(() => ({
    type: asset.type as AssetType,
    name: asset.name,
    location: asset.location ?? "",
    condition: asset.condition,
    notes: asset.notes ?? "",
    qrTagId: asset.qrTagId ?? "",
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (key: keyof FormData, value: string | AssetType | AssetCondition) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors([]);
  };

  const validate = (): boolean => {
    const next: string[] = [];
    if (!form.name.trim()) next.push("Asset name is required");
    if (!form.type) next.push("Asset type is required");
    setErrors(next);
    return next.length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const realm = await getRealm();
      const now = new Date();
      const id = asset._id as unknown as Realm.BSON.ObjectId;
      realm.write(() => {
        const found = realm.objectForPrimaryKey<Asset>("Asset", id);
        if (!found) throw new Error("Asset not found");
        found.type = form.type;
        found.name = form.name.trim();
        found.location = form.location.trim() || undefined;
        found.condition = form.condition;
        found.notes = form.notes.trim() || undefined;
        found.qrTagId = form.qrTagId.trim() || undefined;
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
            Edit Asset
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

          <View style={[layoutStyles.mb3]}>
            <Select
              label="Asset Type *"
              value={form.type}
              onChange={(v) => handleChange("type", v as AssetType)}
              options={assetTypeOptions}
            />
          </View>

          <Input
            label="Asset Name *"
            value={form.name}
            onChangeText={(v) => handleChange("name", v)}
            placeholder="Enter asset name"
            style={[layoutStyles.mb3]}
          />

          <Input
            label="Location"
            value={form.location}
            onChangeText={(v) => handleChange("location", v)}
            placeholder="Enter asset location"
            style={[layoutStyles.mb3]}
          />

          <View style={[layoutStyles.mb3]}>
            <Select
              label="Condition *"
              value={form.condition}
              onChange={(v) => handleChange("condition", v as AssetCondition)}
              options={[
                { value: AssetCondition.GOOD, label: "Good" },
                { value: AssetCondition.FAIR, label: "Fair" },
                { value: AssetCondition.POOR, label: "Poor" },
              ]}
            />
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

