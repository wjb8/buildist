import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardTypeOptions,
  Switch,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Image,
  View as RNView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import DateTimePicker from "@react-native-community/datetimepicker";
import Realm from "realm";
import { getRealm } from "@/storage/realm";
import { View } from "./View";
import { Text } from "./Text";
import { Input } from "./Input";
import { Button } from "./Button";
import { Card } from "./Card";
import { colors, layoutStyles, spacing, inputStyles } from "@/styles";
import Select from "./Select";
import { AssetCondition } from "@/types";
import { Road } from "@/storage/models/assets/Road";

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
  updateAsset: boolean;
  newAssetCondition?: AssetCondition;
  issueType: string | null; // potholes | cracks | drainage | other | null
  priority: string | null; // low | medium | high | null
  photos: string[];
  inspectionDate: Date | null;
  showInspectionDatePicker?: boolean;
}

const initialState: FormState = {
  inspector: "",
  description: "",
  score: "",
  maintenanceNeeded: false,
  nextDue: null,
  showDatePicker: false,
  updateAsset: false,
  newAssetCondition: undefined,
  issueType: null,
  priority: null,
  photos: [],
  inspectionDate: null,
  showInspectionDatePicker: false,
};

export default function NewInspectionForm({ assetId, onCreated }: NewInspectionFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualEditedMaintenance, setManualEditedMaintenance] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermissionStatus, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef<any>(null);

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

    // Validate inspection date is not in the future
    if (form.inspectionDate && form.inspectionDate > new Date()) {
      nextErrors.push("Inspection date cannot be in the future");
    }

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
          timestamp: form.inspectionDate ?? now,
          maintenanceNeeded: form.maintenanceNeeded,
          issueType: form.issueType || undefined,
          priority: form.priority || undefined,
          photos: form.photos || [],
          nextDue: form.nextDue ?? undefined,
          createdAt: now,
          updatedAt: now,
          synced: false,
        });

        if (form.updateAsset && form.newAssetCondition) {
          const road = realm.objectForPrimaryKey<Road>("Road", new Realm.BSON.ObjectId(assetId));
          if (road) {
            road.condition = form.newAssetCondition;
            road.updatedAt = now;
            road.synced = false;
          }
        }
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

  const ensurePermissions = async (): Promise<boolean> => {
    try {
      if (!cameraPermission?.granted) {
        const cam = await requestCameraPermission();
        if (!cam.granted) return false;
      }
      if (!mediaPermissionStatus?.granted) {
        const med = await requestMediaPermission();
        if (!med.granted) return false;
      }
      return true;
    } catch (e) {
      console.error("Permission error", e);
      return false;
    }
  };

  const handleAddPhoto = async () => {
    const ok = await ensurePermissions();
    if (!ok) {
      Alert.alert("Permission Required", "Camera and photo permissions are required.");
      return;
    }
    setShowCamera(true);
  };

  const handleCapture = async () => {
    try {
      if (!cameraRef.current) return;
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });
      if (!result?.uri) return;
      // Save to library and keep local URI
      await MediaLibrary.saveToLibraryAsync(result.uri);
      setForm((prev) => ({ ...prev, photos: [...prev.photos, result.uri] }));
      setShowCamera(false);
    } catch (e) {
      console.error("Failed to capture photo", e);
      Alert.alert("Error", "Could not capture photo. Please try again.");
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

        {/* Issue Type & Priority */}
        <View row style={[layoutStyles.mb3]}>
          <View style={[layoutStyles.flex, layoutStyles.mr2]}>
            <Select
              label="Issue Type"
              value={form.issueType || ""}
              onChange={(v) => handleChange("issueType", v === "" ? null : String(v))}
              options={[
                { value: "", label: "None" },
                { value: "potholes", label: "Potholes" },
                { value: "cracks", label: "Cracks" },
                { value: "drainage", label: "Drainage" },
                { value: "other", label: "Other" },
              ]}
            />
          </View>
          <View style={[layoutStyles.flex]}>
            <Select
              label="Priority"
              value={form.priority || ""}
              onChange={(v) => handleChange("priority", v === "" ? null : String(v))}
              options={[
                { value: "", label: "None" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />
          </View>
        </View>

        {/* Inspection Date (override) */}
        <View style={[layoutStyles.mb3]}>
          <Text variant="bodySmall" style={[layoutStyles.mb1]}>
            Inspection Date (optional)
          </Text>
          <Pressable
            onPress={() => handleChange("showInspectionDatePicker", true)}
            style={[inputStyles.base]}
          >
            <Text variant="body">
              {form.inspectionDate
                ? form.inspectionDate.toISOString().slice(0, 10)
                : "Use today's date"}
            </Text>
          </Pressable>
          {form.showInspectionDatePicker && (
            <DateTimePicker
              value={form.inspectionDate ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={(_, date) => {
                if (Platform.OS !== "ios") handleChange("showInspectionDatePicker", false);
                handleChange("inspectionDate", date ?? null);
              }}
            />
          )}
          {form.inspectionDate && (
            <View style={[layoutStyles.mt2, { alignItems: "flex-end" }]}>
              <Button
                variant="secondary"
                size="small"
                onPress={() => handleChange("inspectionDate", null)}
              >
                Clear date
              </Button>
            </View>
          )}
        </View>

        {/* Photos */}
        <View style={[layoutStyles.mb3]}>
          <Text variant="bodySmall" style={[layoutStyles.mb1]}>
            Photos (optional)
          </Text>
          <View row style={[layoutStyles.rowSpaceBetween]}>
            <Button variant="secondary" size="small" onPress={handleAddPhoto}>
              Add Photo
            </Button>
            {form.photos.length > 0 && <Text variant="bodySmall">{form.photos.length} added</Text>}
          </View>
          {form.photos.length > 0 && (
            <RNView style={{ marginTop: spacing.sm, flexDirection: "row", flexWrap: "wrap" }}>
              {form.photos.slice(0, 3).map((uri, idx) => (
                <RNView key={uri} style={{ marginRight: spacing.sm, marginBottom: spacing.sm }}>
                  <Image source={{ uri }} style={{ width: 72, height: 72, borderRadius: 6 }} />
                </RNView>
              ))}
            </RNView>
          )}
        </View>

        <View style={[layoutStyles.mb3]}>
          <Text variant="bodySmall" style={[layoutStyles.mb1]}>
            Update Asset (optional)
          </Text>
          <View
            row
            style={[layoutStyles.mb2, layoutStyles.rowCenter, { justifyContent: "space-between" }]}
          >
            <Text variant="body">Update condition</Text>
            <Switch
              value={form.updateAsset}
              onValueChange={(v) => setForm((prev) => ({ ...prev, updateAsset: v }))}
              thumbColor={form.updateAsset ? colors.success.main : colors.border.medium}
              trackColor={{ true: colors.success.light, false: colors.border.medium }}
            />
          </View>

          {form.updateAsset && (
            <Select
              label="New Asset Condition"
              value={form.newAssetCondition || AssetCondition.GOOD}
              onChange={(v) =>
                setForm((prev) => ({ ...prev, newAssetCondition: v as AssetCondition }))
              }
              options={[
                { value: AssetCondition.GOOD, label: "Good" },
                { value: AssetCondition.FAIR, label: "Fair" },
                { value: AssetCondition.POOR, label: "Poor" },
              ]}
            />
          )}
        </View>

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

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={[layoutStyles.flex]}>
          <CameraView ref={cameraRef} style={[layoutStyles.flex]} facing="back">
            <View
              style={{ position: "absolute", bottom: 40, left: 0, right: 0, alignItems: "center" }}
            >
              <View row>
                <Button variant="secondary" onPress={() => setShowCamera(false)}>
                  Cancel
                </Button>
                <Button variant="primary" style={[layoutStyles.ml2]} onPress={handleCapture}>
                  Capture
                </Button>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
    </ScrollView>
  );
}
