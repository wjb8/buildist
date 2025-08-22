import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Road, AssetFactory } from "@storage/models";
import { getRealm } from "@storage/realm";
import { AssetCondition, RoadSurfaceType, TrafficVolume } from "@/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  AssetList: undefined;
  AssetForm: { assetId?: string };
};

type AssetFormNavigationProp = NativeStackNavigationProp<RootStackParamList, "AssetForm">;
type AssetFormRouteProp = RouteProp<RootStackParamList, "AssetForm">;

interface FormData {
  name: string;
  location: string;
  condition: AssetCondition;
  notes: string;
  qrTagId: string;
  // Road-specific fields
  surfaceType: RoadSurfaceType;
  trafficVolume: TrafficVolume;
  length: string;
  width: string;
  lanes: string;
  speedLimit: string;
}

interface FormErrors {
  name?: string;
  location?: string;
  condition?: string;
  // Road-specific validation errors
  roadData?: string[];
}

const AssetFormScreen = () => {
  const navigation = useNavigation<AssetFormNavigationProp>();
  const route = useRoute<AssetFormRouteProp>();
  const { assetId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [road, setRoad] = useState<Road | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    condition: AssetCondition.GOOD,
    notes: "",
    qrTagId: "",
    // Road-specific fields
    surfaceType: RoadSurfaceType.ASPHALT,
    trafficVolume: TrafficVolume.LOW,
    length: "",
    width: "",
    lanes: "",
    speedLimit: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const isEditMode = Boolean(assetId);

  // Load road data for editing
  useEffect(() => {
    if (assetId) {
      loadRoad();
    } else {
      // Generate QR tag ID for new roads
      generateQRTagId();
    }
  }, [assetId]);

  const loadRoad = async () => {
    try {
      setLoading(true);
      const realm = await getRealm();
      const foundRoad = realm.objectForPrimaryKey("Road", assetId!);

      if (!foundRoad) {
        Alert.alert("Error", "Road not found");
        navigation.goBack();
        return;
      }

      // Use AssetFactory to create the road
      const typedRoad = AssetFactory.createRoad(foundRoad);
      setRoad(typedRoad);

      setFormData({
        name: typedRoad.name,
        location: typedRoad.location || "",
        condition: typedRoad.condition,
        notes: typedRoad.notes || "",
        qrTagId: typedRoad.qrTagId || "",
        // Road-specific fields
        surfaceType: typedRoad.surfaceType,
        trafficVolume: typedRoad.trafficVolume,
        length: typedRoad.length?.toString() || "",
        width: typedRoad.width?.toString() || "",
        lanes: typedRoad.lanes?.toString() || "",
        speedLimit: typedRoad.speedLimit?.toString() || "",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to load road");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const generateQRTagId = () => {
    const timestamp = Date.now().toString(36);
    const qrTagId = `ROA-${timestamp}`;
    setFormData((prev) => ({ ...prev, qrTagId }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Road name is required";
    }

    if (!formData.condition) {
      newErrors.condition = "Road condition is required";
    }

    // Road-specific validation
    const roadValidation = validateRoadData();
    if (!roadValidation.isValid) {
      newErrors.roadData = roadValidation.errors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRoadData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.surfaceType) {
      errors.push("Surface type is required");
    }

    if (!formData.trafficVolume) {
      errors.push("Traffic volume is required");
    }

    if (formData.length && parseFloat(formData.length) <= 0) {
      errors.push("Length must be positive");
    }

    if (formData.width && parseFloat(formData.width) <= 0) {
      errors.push("Width must be positive");
    }

    if (formData.lanes && parseInt(formData.lanes) <= 0) {
      errors.push("Number of lanes must be positive");
    }

    if (formData.speedLimit && parseFloat(formData.speedLimit) <= 0) {
      errors.push("Speed limit must be positive");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const realm = await getRealm();

      if (isEditMode && road) {
        // Update existing road
        realm.write(() => {
          road.name = formData.name.trim();
          road.location = formData.location.trim() || undefined;
          road.condition = formData.condition;
          road.notes = formData.notes.trim() || undefined;
          road.qrTagId = formData.qrTagId.trim() || undefined;
          // Road-specific fields
          road.surfaceType = formData.surfaceType;
          road.trafficVolume = formData.trafficVolume;
          road.length = formData.length ? parseFloat(formData.length) : undefined;
          road.width = formData.width ? parseFloat(formData.width) : undefined;
          road.lanes = formData.lanes ? parseInt(formData.lanes) : undefined;
          road.speedLimit = formData.speedLimit ? parseFloat(formData.speedLimit) : undefined;
          road.updatedAt = new Date();
        });

        Alert.alert("Success", "Road updated successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        // Create new road using AssetFactory
        await AssetFactory.createNewRoad({
          name: formData.name.trim(),
          location: formData.location.trim() || undefined,
          condition: formData.condition,
          notes: formData.notes.trim() || undefined,
          qrTagId: formData.qrTagId.trim() || undefined,
          // Road-specific fields
          surfaceType: formData.surfaceType,
          trafficVolume: formData.trafficVolume,
          length: formData.length ? parseFloat(formData.length) : undefined,
          width: formData.width ? parseFloat(formData.width) : undefined,
          lanes: formData.lanes ? parseInt(formData.lanes) : undefined,
          speedLimit: formData.speedLimit ? parseFloat(formData.speedLimit) : undefined,
        });

        Alert.alert("Success", "Road created successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", `Failed to ${isEditMode ? "update" : "create"} road`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderSurfaceTypeSelector = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>Surface Type</Text>
      <View style={styles.selectorContainer}>
        {Object.values(RoadSurfaceType).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.selectorButton, formData.surfaceType === type && styles.selectedButton]}
            onPress={() => setFormData((prev) => ({ ...prev, surfaceType: type }))}
          >
            <Text
              style={[
                styles.selectorButtonText,
                formData.surfaceType === type && styles.selectedButtonText,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTrafficVolumeSelector = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>Traffic Volume</Text>
      <View style={styles.selectorContainer}>
        {Object.values(TrafficVolume).map((volume) => (
          <TouchableOpacity
            key={volume}
            style={[
              styles.selectorButton,
              formData.trafficVolume === volume && styles.selectedButton,
            ]}
            onPress={() => setFormData((prev) => ({ ...prev, trafficVolume: volume }))}
          >
            <Text
              style={[
                styles.selectorButtonText,
                formData.trafficVolume === volume && styles.selectedButtonText,
              ]}
            >
              {volume.charAt(0).toUpperCase() + volume.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderConditionSelector = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>Condition</Text>
      <View style={styles.selectorContainer}>
        {Object.values(AssetCondition).map((condition) => (
          <TouchableOpacity
            key={condition}
            style={[
              styles.selectorButton,
              formData.condition === condition && styles.selectedButton,
            ]}
            onPress={() => setFormData((prev) => ({ ...prev, condition }))}
          >
            <Text
              style={[
                styles.selectorButtonText,
                formData.condition === condition && styles.selectedButtonText,
              ]}
            >
              {condition.charAt(0).toUpperCase() + condition.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading road...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isEditMode ? "Edit Road" : "Create New Road"}</Text>
      </View>

      <View style={styles.form}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              placeholder="Enter road name"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, location: text }))}
              placeholder="Enter location"
            />
          </View>

          {renderConditionSelector()}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, notes: text }))}
              placeholder="Enter notes"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>QR Tag ID</Text>
            <TextInput
              style={styles.input}
              value={formData.qrTagId}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, qrTagId: text }))}
              placeholder="Auto-generated"
            />
          </View>
        </View>

        {/* Road-Specific Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Road Specifications</Text>

          {renderSurfaceTypeSelector()}
          {renderTrafficVolumeSelector()}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Length (meters)</Text>
            <TextInput
              style={styles.input}
              value={formData.length}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, length: text }))}
              placeholder="Enter length"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Width (meters)</Text>
            <TextInput
              style={styles.input}
              value={formData.width}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, width: text }))}
              placeholder="Enter width"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Number of Lanes</Text>
            <TextInput
              style={styles.input}
              value={formData.lanes}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, lanes: text }))}
              placeholder="Enter number of lanes"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Speed Limit (km/h)</Text>
            <TextInput
              style={styles.input}
              value={formData.speedLimit}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, speedLimit: text }))}
              placeholder="Enter speed limit"
              keyboardType="numeric"
            />
          </View>

          {errors.roadData && errors.roadData.length > 0 && (
            <View style={styles.errorContainer}>
              {errors.roadData.map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  • {error}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>{isEditMode ? "Update" : "Create"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  textArea: {
    height: 80,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 4,
  },
  selectorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectorButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  selectorButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  selectedButtonText: {
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
});

export default AssetFormScreen;
