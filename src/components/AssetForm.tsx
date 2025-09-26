import { useState } from "react";
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { AssetType, AssetCondition, RoadSurfaceType, TrafficVolume, type RoadData } from "@/types";
import { getRealm } from "@/storage/realm";
import Realm from "realm";
import { View } from "./View";
import { Text } from "./Text";
import { Input } from "./Input";
import { Button } from "./Button";
import Select from "./Select";
import { Card } from "./Card";
import { colors, spacing, layoutStyles, textStyles, buttonStyles, inputStyles } from "@/styles";

interface AssetFormProps {
  onAssetCreated?: () => void;
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

const initialFormData: FormData = {
  name: "",
  location: "",
  condition: AssetCondition.GOOD,
  notes: "",
  qrTagId: "",
  surfaceType: RoadSurfaceType.ASPHALT,
  trafficVolume: TrafficVolume.MEDIUM,
  length: "",
  width: "",
  lanes: "",
  speedLimit: "",
};

export default function AssetForm({ onAssetCreated }: AssetFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleEnumChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push("Road name is required");
    }

    if (formData.length && parseFloat(formData.length) <= 0) {
      newErrors.push("Length must be positive");
    }

    if (formData.width && parseFloat(formData.width) <= 0) {
      newErrors.push("Width must be positive");
    }

    if (formData.lanes && parseInt(formData.lanes) <= 0) {
      newErrors.push("Number of lanes must be positive");
    }

    if (formData.speedLimit && parseInt(formData.speedLimit) <= 0) {
      newErrors.push("Speed limit must be positive");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Helper function for QR tag generation
  const generateQRTagId = (): string => {
    const timestamp = Date.now().toString(36);
    return `ROA-${timestamp}`;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    console.log("formData", formData);

    try {
      // TODO: When we add more asset types, we'll use a generic createAsset function
      // or asset factory pattern instead of hardcoding RoadData type
      const assetData: RoadData = {
        type: AssetType.ROAD,
        name: formData.name.trim(),
        location: formData.location.trim() || undefined,
        condition: formData.condition,
        notes: formData.notes.trim() || undefined,
        qrTagId: formData.qrTagId.trim() || undefined,
        surfaceType: formData.surfaceType,
        trafficVolume: formData.trafficVolume,
        length: formData.length ? parseFloat(formData.length) : undefined,
        width: formData.width ? parseFloat(formData.width) : undefined,
        lanes: formData.lanes ? parseInt(formData.lanes) : undefined,
        speedLimit: formData.speedLimit ? parseInt(formData.speedLimit) : undefined,
      };

      const realm = await getRealm();

      // Create the road asset using Realm
      realm.write(() => {
        realm.create("Road", {
          _id: new Realm.BSON.ObjectId(),
          name: assetData.name,
          location: assetData.location,
          condition: assetData.condition,
          notes: assetData.notes,
          qrTagId: assetData.qrTagId || generateQRTagId(),
          surfaceType: assetData.surfaceType,
          trafficVolume: assetData.trafficVolume,
          length: assetData.length,
          width: assetData.width,
          lanes: assetData.lanes,
          speedLimit: assetData.speedLimit,
          createdAt: new Date(),
          updatedAt: new Date(),
          synced: false,
        });
      });

      Alert.alert("Success", "Road asset created successfully!");
      setFormData(initialFormData);
      onAssetCreated?.();
    } catch (error) {
      console.error("Failed to create asset:", error);
      Alert.alert("Error", "Failed to create asset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        value={String(formData[field])}
        onChange={(val) => handleEnumChange(field, val)}
        options={Object.entries(enumValues).map(([key, value]) => ({ value: key, label: value }))}
      />
    </View>
  );

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
            Create New Road Asset
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
              {errors.map((error, index) => (
                <Text key={index} color="error" style={[layoutStyles.mb1]}>
                  • {error}
                </Text>
              ))}
            </View>
          )}

          <Input
            label="Road Name *"
            value={formData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            placeholder="Enter road name"
            style={[layoutStyles.mb3]}
          />

          <Input
            label="Location"
            value={formData.location}
            onChangeText={(value) => handleInputChange("location", value)}
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
                value={formData.length}
                onChangeText={(value) => handleInputChange("length", value)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={[layoutStyles.flex]}>
              <Input
                label="Width (m)"
                value={formData.width}
                onChangeText={(value) => handleInputChange("width", value)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[layoutStyles.flexRow, layoutStyles.mb3]}>
            <View style={[layoutStyles.flex, layoutStyles.mr2]}>
              <Input
                label="Lanes"
                value={formData.lanes}
                onChangeText={(value) => handleInputChange("lanes", value)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={[layoutStyles.flex]}>
              <Input
                label="Speed Limit (km/h)"
                value={formData.speedLimit}
                onChangeText={(value) => handleInputChange("speedLimit", value)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="QR Tag ID"
            value={formData.qrTagId}
            onChangeText={(value) => handleInputChange("qrTagId", value)}
            placeholder="Leave empty to auto-generate"
            style={[layoutStyles.mb3]}
          />

          <Input
            label="Notes"
            value={formData.notes}
            onChangeText={(value) => handleInputChange("notes", value)}
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
            {isSubmitting ? "Creating..." : "Create Road Asset"}
          </Button>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
