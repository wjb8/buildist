import { useState } from "react";
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { AssetType, AssetCondition } from "@/types/asset";
import { QRService } from "@/services/QRService";
import { getRealm } from "@/storage/realm";
import Realm from "realm";
import { View } from "./View";
import { Text } from "./Text";
import { Input } from "./Input";
import { Button } from "./Button";
import Select from "./Select";
import { Card } from "./Card";
import { colors, spacing, layoutStyles } from "@/styles";

interface AssetFormProps {
  onAssetCreated?: () => void;
}

interface AssetFormData {
  type: AssetType;
  name: string;
  location: string;
  condition: AssetCondition;
  notes: string;
  qrTagId: string;
}

const initialForm: AssetFormData = {
  type: AssetType.ROAD,
  name: "",
  location: "",
  condition: AssetCondition.GOOD,
  notes: "",
  qrTagId: "",
};

const assetTypeOptions = [
  { value: AssetType.ROAD, label: "Road" },
  { value: AssetType.VEHICLE, label: "Vehicle" },
  { value: AssetType.BRIDGE, label: "Bridge" },
  { value: AssetType.SIDEWALK, label: "Sidewalk" },
  { value: AssetType.STREET_LIGHT, label: "Street Light" },
  { value: AssetType.TRAFFIC_SIGNAL, label: "Traffic Signal" },
  { value: AssetType.OTHER, label: "Other" },
];

export default function AssetForm({ onAssetCreated }: AssetFormProps) {
  const [form, setForm] = useState<AssetFormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (field: keyof AssetFormData, value: string | AssetType | AssetCondition) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    if (!form.name.trim()) newErrors.push("Asset name is required");
    if (!form.type) newErrors.push("Asset type is required");
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const realm = await getRealm();

      realm.write(() => {
        realm.create("Asset", {
          _id: new Realm.BSON.ObjectId(),
          type: form.type,
          name: form.name.trim(),
          location: form.location.trim() || undefined,
          condition: form.condition,
          notes: form.notes.trim() || undefined,
          qrTagId: form.qrTagId.trim() || QRService.generateAssetQRTagId(form.type),
          createdAt: new Date(),
          updatedAt: new Date(),
          synced: false,
        });
      });

      Alert.alert("Success", "Asset created successfully!");
      setForm(initialForm);
      onAssetCreated?.();
    } catch (error) {
      console.error("Failed to create asset:", error);
      Alert.alert("Error", "Failed to create asset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={spacing.xl}
      style={[layoutStyles.flex]}
    >
      <ScrollView
        style={[layoutStyles.flex]}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        contentContainerStyle={{ paddingBottom: spacing.xl * 3, flexGrow: 1 }}
      >
        <Card style={[layoutStyles.p4]}>
          <Text variant="h3" style={[layoutStyles.mb4]}>
            Create New Asset
          </Text>

          <View style={[layoutStyles.mb3]}>
            <Select
              label="Asset Type *"
              value={form.type}
              onChange={(v) => handleChange("type", v as AssetType)}
              options={assetTypeOptions}
            />
          </View>

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
              {errors.map((error, index) => (
                <Text key={index} color="error" style={[layoutStyles.mb1]}>
                  • {error}
                </Text>
              ))}
            </View>
          )}

          <Input
            label="Asset Name *"
            value={form.name}
            onChangeText={(value) => handleChange("name", value)}
            placeholder="Enter asset name"
            style={[layoutStyles.mb3]}
          />

          <Input
            label="Location"
            value={form.location}
            onChangeText={(value) => handleChange("location", value)}
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
            onChangeText={(value) => handleChange("qrTagId", value)}
            placeholder="Leave empty to auto-generate"
            style={[layoutStyles.mb3]}
          />

          <Input
            label="Notes"
            value={form.notes}
            onChangeText={(value) => handleChange("notes", value)}
            placeholder="Additional notes"
            multiline
            numberOfLines={3}
            style={[layoutStyles.mb4]}
          />

          <Button
            variant="primary"
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[layoutStyles.fullWidth]}
          >
            {isSubmitting ? "Creating..." : "Create Asset"}
          </Button>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
