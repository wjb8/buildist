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
import { MaterialIcons } from "@expo/vector-icons";
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
import { Asset } from "@/storage/models/assets/Asset";

interface NewInspectionFormProps {
  assetId: string;
  onCreated?: () => void;
}

interface FormState {
  inspector: string;
  description: string;
  condition: AssetCondition;
  maintenanceNeeded: boolean;
  nextDue: Date | null;
  showDatePicker?: boolean;
  issueType: string | null; // potholes | cracks | drainage | other | null
  priority: string | null; // low | medium | high | null
  photos: string[];
  inspectionDate: Date | null;
  showInspectionDatePicker?: boolean;
}

const initialState: FormState = {
  inspector: "",
  description: "",
  condition: AssetCondition.GOOD,
  maintenanceNeeded: false,
  nextDue: null,
  showDatePicker: false,
  issueType: null,
  priority: null,
  photos: [],
  inspectionDate: new Date(), // Default to current date
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
  const [showAddPhotoOptions, setShowAddPhotoOptions] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryAssets, setGalleryAssets] = useState<any[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  // Auto-calc maintenanceNeeded when condition is POOR unless manually edited
  useEffect(() => {
    if (manualEditedMaintenance) return;
    setForm((prev) => ({ ...prev, maintenanceNeeded: form.condition === AssetCondition.POOR }));
  }, [form.condition, manualEditedMaintenance]);

  const handleChange = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors([]);
  };

  const validate = (): boolean => {
    const nextErrors: string[] = [];
    if (!assetId) nextErrors.push("Missing asset reference");
    if (!form.inspector.trim()) nextErrors.push("Inspector is required");
    if (!form.condition) nextErrors.push("Condition is required");

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
      // Map selected condition to a numeric score for compatibility
      const scoreNum =
        form.condition === AssetCondition.POOR ? 2 : form.condition === AssetCondition.FAIR ? 3 : 4;
      const newCondition = form.condition;

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

        // Update asset condition based on inspection score
        const objId = new Realm.BSON.ObjectId(assetId);
        const asset = realm.objectForPrimaryKey<Asset>("Asset", objId);
        if (asset && asset.condition !== newCondition) {
          asset.condition = newCondition;
          asset.updatedAt = now;
          asset.synced = false;
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
    setShowAddPhotoOptions(true);
  };

  const openCamera = async () => {
    const ok = await ensurePermissions();
    if (!ok) {
      Alert.alert("Permission Required", "Camera and photo permissions are required.");
      return;
    }
    setShowAddPhotoOptions(false);
    setShowCamera(true);
  };

  const openGallery = async () => {
    try {
      if (!mediaPermissionStatus?.granted) {
        const med = await requestMediaPermission();
        if (!med.granted) return;
      }
      setIsLoadingGallery(true);
      const assets = await MediaLibrary.getAssetsAsync({
        first: 40,
        sortBy: MediaLibrary.SortBy.creationTime,
        mediaType: [MediaLibrary.MediaType.photo],
      });
      setGalleryAssets(assets.assets || []);
      setShowAddPhotoOptions(false);
      setShowGallery(true);
    } catch (e) {
      console.error("Failed to open gallery", e);
      Alert.alert("Error", "Could not load gallery.");
    } finally {
      setIsLoadingGallery(false);
    }
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

        {/* Inspection Date */}
        <View style={layoutStyles.mb3}>
          <Text variant="bodySmall" style={layoutStyles.mb1}>
            Inspection Date
          </Text>
          <Pressable
            onPress={() => handleChange("showInspectionDatePicker", true)}
            style={[
              inputStyles.base,
              {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              },
            ]}
          >
            <Text variant="body" style={{ flex: 1, textAlign: "center" }}>
              {form.inspectionDate?.toISOString().slice(0, 10) ||
                new Date().toISOString().slice(0, 10)}
            </Text>
            <MaterialIcons name="event" size={20} color={colors.text.secondary} />
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

          <View style={[layoutStyles.mt3]}>
            <Text variant="bodySmall" style={[layoutStyles.mb1]}>
              Next Due (optional)
            </Text>
            <Pressable
              onPress={() => handleChange("showDatePicker", true)}
              style={[
                inputStyles.base,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              ]}
            >
              <Text variant="body" style={{ flex: 1, textAlign: "center" }}>
                {form.nextDue ? form.nextDue.toISOString().slice(0, 10) : "Select date"}
              </Text>
              <MaterialIcons name="event" size={20} color={colors.text.secondary} />
            </Pressable>
          </View>
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

        {/* Photos */}
        <View style={[layoutStyles.mb3]}>
          <Text variant="bodySmall" style={[layoutStyles.mb1]}>
            Photos
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

      {/* Add Photo Options Modal */}
      <Modal
        visible={showAddPhotoOptions}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddPhotoOptions(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center" }}>
          <Card style={[layoutStyles.p3, { marginHorizontal: spacing.lg }]}>
            <Text variant="h4" style={[layoutStyles.mb2]}>
              Add Photo
            </Text>
            <Button variant="primary" style={[layoutStyles.mb2]} onPress={openCamera}>
              Take Photo
            </Button>
            <Button variant="secondary" onPress={openGallery}>
              Choose from Gallery
            </Button>
            <Button
              variant="secondary"
              style={[layoutStyles.mt2]}
              onPress={() => setShowAddPhotoOptions(false)}
            >
              Cancel
            </Button>
          </Card>
        </View>
      </Modal>

      {/* Simple Gallery Picker Modal */}
      <Modal
        visible={showGallery}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGallery(false)}
      >
        <ScrollView style={[layoutStyles.flex]}>
          <View style={[layoutStyles.p3]}>
            <Text variant="h4" style={[layoutStyles.mb2]}>
              Select a photo
            </Text>
            {isLoadingGallery && (
              <Text variant="body" style={[layoutStyles.mb2]}>
                Loading...
              </Text>
            )}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {galleryAssets.map((asset) => (
                <Pressable
                  key={asset.id}
                  onPress={async () => {
                    try {
                      const info = await MediaLibrary.getAssetInfoAsync(asset.id);
                      const uri = info.localUri || asset.uri;
                      if (uri) {
                        setForm((prev) => ({ ...prev, photos: [...prev.photos, uri] }));
                        setShowGallery(false);
                      }
                    } catch (e) {
                      console.error("Failed to get asset info", e);
                    }
                  }}
                >
                  <Image
                    source={{ uri: asset.uri }}
                    style={{ width: 100, height: 100, borderRadius: 6 }}
                  />
                </Pressable>
              ))}
            </View>
            <View style={[layoutStyles.mt2]}>
              <Button variant="secondary" onPress={() => setShowGallery(false)}>
                Close
              </Button>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}
