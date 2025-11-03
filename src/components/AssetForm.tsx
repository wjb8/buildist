import { useState } from "react";
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { AssetType, AssetCondition, RoadSurfaceType, TrafficVolume, type RoadData } from "@/types";
import { VehiclePriority, type VehicleData } from "@/types/vehicle";
import { QRService } from "@/services/QRService";
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

type AssetTypeValue = AssetType.ROAD | AssetType.VEHICLE;

interface RoadFormData {
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

interface VehicleFormDataShape {
  name: string;
  identifier: string;
  location: string;
  condition: AssetCondition;
  notes: string;
  qrTagId: string;
  mileage: string;
  hours: string;
  lastServiceDate: string;
  requiresService: string; // "yes" | "no"
  priority: VehiclePriority | "";
}

const initialRoadForm: RoadFormData = {
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

const initialVehicleForm: VehicleFormDataShape = {
  name: "",
  identifier: "",
  location: "",
  condition: AssetCondition.GOOD,
  notes: "",
  qrTagId: "",
  mileage: "",
  hours: "",
  lastServiceDate: "",
  requiresService: "no",
  priority: "",
};

export default function AssetForm({ onAssetCreated }: AssetFormProps) {
  const [assetType, setAssetType] = useState<AssetTypeValue>(AssetType.ROAD);
  const [roadForm, setRoadForm] = useState<RoadFormData>(initialRoadForm);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormDataShape>(initialVehicleForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleRoadChange = (field: keyof RoadFormData, value: string) => {
    setRoadForm((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleVehicleChange = (field: keyof VehicleFormDataShape, value: string) => {
    setVehicleForm((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (assetType === AssetType.ROAD) {
      if (!roadForm.name.trim()) newErrors.push("Road name is required");
      if (roadForm.length && parseFloat(roadForm.length) <= 0)
        newErrors.push("Length must be positive");
      if (roadForm.width && parseFloat(roadForm.width) <= 0)
        newErrors.push("Width must be positive");
      if (roadForm.lanes && parseInt(roadForm.lanes) <= 0)
        newErrors.push("Number of lanes must be positive");
      if (roadForm.speedLimit && parseInt(roadForm.speedLimit) <= 0)
        newErrors.push("Speed limit must be positive");
    } else {
      if (!vehicleForm.name.trim()) newErrors.push("Vehicle name is required");
      if (!vehicleForm.identifier.trim()) newErrors.push("Identifier is required");
      if (vehicleForm.mileage && parseFloat(vehicleForm.mileage) < 0)
        newErrors.push("Mileage must be e= 0");
      if (vehicleForm.hours && parseFloat(vehicleForm.hours) < 0)
        newErrors.push("Hours must be e= 0");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Helper functions for QR tag generation
  const generateRoadQR = (): string => {
    const timestamp = Date.now().toString(36);
    return `ROA-${timestamp}`;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const realm = await getRealm();

      if (assetType === AssetType.ROAD) {
        const roadData: RoadData = {
          type: AssetType.ROAD,
          name: roadForm.name.trim(),
          location: roadForm.location.trim() || undefined,
          condition: roadForm.condition,
          notes: roadForm.notes.trim() || undefined,
          qrTagId: roadForm.qrTagId.trim() || undefined,
          surfaceType: roadForm.surfaceType,
          trafficVolume: roadForm.trafficVolume,
          length: roadForm.length ? parseFloat(roadForm.length) : undefined,
          width: roadForm.width ? parseFloat(roadForm.width) : undefined,
          lanes: roadForm.lanes ? parseInt(roadForm.lanes) : undefined,
          speedLimit: roadForm.speedLimit ? parseInt(roadForm.speedLimit) : undefined,
        };

        realm.write(() => {
          realm.create("Road", {
            _id: new Realm.BSON.ObjectId(),
            name: roadData.name,
            location: roadData.location,
            condition: roadData.condition,
            notes: roadData.notes,
            qrTagId: roadData.qrTagId || generateRoadQR(),
            surfaceType: roadData.surfaceType,
            trafficVolume: roadData.trafficVolume,
            length: roadData.length,
            width: roadData.width,
            lanes: roadData.lanes,
            speedLimit: roadData.speedLimit,
            createdAt: new Date(),
            updatedAt: new Date(),
            synced: false,
          });
        });

        Alert.alert("Success", "Road asset created successfully!");
        setRoadForm(initialRoadForm);
      } else {
        const vehicleData: VehicleData = {
          type: AssetType.VEHICLE,
          name: vehicleForm.name.trim(),
          location: vehicleForm.location.trim() || undefined,
          condition: vehicleForm.condition,
          notes: vehicleForm.notes.trim() || undefined,
          qrTagId: vehicleForm.qrTagId.trim() || undefined,
          identifier: vehicleForm.identifier.trim(),
          mileage: vehicleForm.mileage ? parseFloat(vehicleForm.mileage) : undefined,
          hours: vehicleForm.hours ? parseFloat(vehicleForm.hours) : undefined,
          lastServiceDate: vehicleForm.lastServiceDate
            ? new Date(vehicleForm.lastServiceDate)
            : undefined,
          requiresService:
            vehicleForm.requiresService === "yes"
              ? true
              : vehicleForm.requiresService === "no"
              ? false
              : undefined,
          priority: (vehicleForm.priority || undefined) as VehiclePriority | undefined,
          photoUris: [],
        };

        realm.write(() => {
          realm.create("Vehicle", {
            _id: new Realm.BSON.ObjectId(),
            name: vehicleData.name,
            identifier: vehicleData.identifier,
            location: vehicleData.location,
            condition: vehicleData.condition,
            notes: vehicleData.notes,
            qrTagId: vehicleData.qrTagId || QRService.generateVehicleQRTagId(),
            mileage: vehicleData.mileage,
            hours: vehicleData.hours,
            lastServiceDate: vehicleData.lastServiceDate,
            requiresService: vehicleData.requiresService,
            priority: vehicleData.priority,
            photoUris: vehicleData.photoUris || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            synced: false,
          });
        });

        Alert.alert("Success", "Vehicle created successfully!");
        setVehicleForm(initialVehicleForm);
      }

      onAssetCreated?.();
    } catch (error) {
      console.error("Failed to create asset:", error);
      Alert.alert("Error", "Failed to create asset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoadEnumSelect = (
    field: keyof RoadFormData,
    enumValues: Record<string, string>,
    label: string,
    required: boolean = false
  ) => (
    <View style={[layoutStyles.mb3]}>
      <Select
        label={`${label} ${required ? "*" : ""}`.trim()}
        value={String(roadForm[field])}
        onChange={(val) => handleRoadChange(field, val)}
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
            Create New Asset
          </Text>

          <View style={[layoutStyles.mb3]}>
            <Select
              label="Asset Type *"
              value={assetType}
              onChange={(v) => setAssetType(v as AssetTypeValue)}
              options={[
                { value: AssetType.ROAD, label: "Road" },
                { value: AssetType.VEHICLE, label: "Vehicle" },
              ]}
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

          {assetType === AssetType.ROAD ? (
            <>
              <Input
                label="Road Name *"
                value={roadForm.name}
                onChangeText={(value) => handleRoadChange("name", value)}
                placeholder="Enter road name"
                style={[layoutStyles.mb3]}
              />

              <Input
                label="Location"
                value={roadForm.location}
                onChangeText={(value) => handleRoadChange("location", value)}
                placeholder="Enter road location"
                style={[layoutStyles.mb3]}
              />

              {renderRoadEnumSelect(
                "condition",
                {
                  [AssetCondition.GOOD]: "Good",
                  [AssetCondition.FAIR]: "Fair",
                  [AssetCondition.POOR]: "Poor",
                },
                "Condition *",
                true
              )}

              {renderRoadEnumSelect(
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

              {renderRoadEnumSelect(
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
                    value={roadForm.length}
                    onChangeText={(value) => handleRoadChange("length", value)}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[layoutStyles.flex]}>
                  <Input
                    label="Width (m)"
                    value={roadForm.width}
                    onChangeText={(value) => handleRoadChange("width", value)}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[layoutStyles.flexRow, layoutStyles.mb3]}>
                <View style={[layoutStyles.flex, layoutStyles.mr2]}>
                  <Input
                    label="Lanes"
                    value={roadForm.lanes}
                    onChangeText={(value) => handleRoadChange("lanes", value)}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[layoutStyles.flex]}>
                  <Input
                    label="Speed Limit (km/h)"
                    value={roadForm.speedLimit}
                    onChangeText={(value) => handleRoadChange("speedLimit", value)}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Input
                label="QR Tag ID"
                value={roadForm.qrTagId}
                onChangeText={(value) => handleRoadChange("qrTagId", value)}
                placeholder="Leave empty to auto-generate"
                style={[layoutStyles.mb3]}
              />

              <Input
                label="Notes"
                value={roadForm.notes}
                onChangeText={(value) => handleRoadChange("notes", value)}
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
            </>
          ) : (
            <>
              <Input
                label="Vehicle Name *"
                value={vehicleForm.name}
                onChangeText={(value) => handleVehicleChange("name", value)}
                placeholder="e.g., Snowplow Truck #3"
                style={[layoutStyles.mb3]}
              />

              <Input
                label="Identifier *"
                value={vehicleForm.identifier}
                onChangeText={(value) => handleVehicleChange("identifier", value)}
                placeholder="Fleet identifier"
                style={[layoutStyles.mb3]}
              />

              <Input
                label="Location"
                value={vehicleForm.location}
                onChangeText={(value) => handleVehicleChange("location", value)}
                placeholder="Where is it based?"
                style={[layoutStyles.mb3]}
              />

              <View style={[layoutStyles.mb3]}>
                <Select
                  label="Condition *"
                  value={vehicleForm.condition}
                  onChange={(v) => handleVehicleChange("condition", v)}
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
                    value={vehicleForm.mileage}
                    onChangeText={(v) => handleVehicleChange("mileage", v.replace(/[^0-9.]/g, ""))}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[layoutStyles.flex]}>
                  <Input
                    label="Hours"
                    value={vehicleForm.hours}
                    onChangeText={(v) => handleVehicleChange("hours", v.replace(/[^0-9.]/g, ""))}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Input
                label="Last Service Date"
                value={vehicleForm.lastServiceDate}
                onChangeText={(v) => handleVehicleChange("lastServiceDate", v)}
                placeholder="YYYY-MM-DD"
                style={[layoutStyles.mb3]}
              />

              <View style={[layoutStyles.flexRow, layoutStyles.mb3]}>
                <View style={[layoutStyles.flex, layoutStyles.mr2]}>
                  <Select
                    label="Requires Service?"
                    value={vehicleForm.requiresService}
                    onChange={(v) => handleVehicleChange("requiresService", v)}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />
                </View>
                <View style={[layoutStyles.flex]}>
                  <Select
                    label="Priority"
                    value={vehicleForm.priority}
                    onChange={(v) => handleVehicleChange("priority", v)}
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
                value={vehicleForm.qrTagId}
                onChangeText={(value) => handleVehicleChange("qrTagId", value)}
                placeholder="Leave empty to auto-generate"
                style={[layoutStyles.mb3]}
              />

              <Input
                label="Notes"
                value={vehicleForm.notes}
                onChangeText={(value) => handleVehicleChange("notes", value)}
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
            </>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
