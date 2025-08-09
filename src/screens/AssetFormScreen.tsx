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
import { Asset } from "@storage/models";
import { collections, database } from "@storage/database";
import { AssetType, AssetCondition, CreateAssetData, UpdateAssetData } from "@types/models";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Navigation types
type RootStackParamList = {
  AssetList: undefined;
  AssetForm: { assetId?: string };
};

type AssetFormNavigationProp = NativeStackNavigationProp<RootStackParamList, "AssetForm">;
type AssetFormRouteProp = RouteProp<RootStackParamList, "AssetForm">;

interface FormData {
  name: string;
  type: AssetType;
  location: string;
  condition: AssetCondition;
  notes: string;
  qrTagId: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  condition?: string;
}

const AssetFormScreen: React.FC = () => {
  const navigation = useNavigation<AssetFormNavigationProp>();
  const route = useRoute<AssetFormRouteProp>();
  const { assetId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: AssetType.EQUIPMENT,
    location: "",
    condition: AssetCondition.GOOD,
    notes: "",
    qrTagId: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const isEditMode = Boolean(assetId);

  // Load asset data for editing
  useEffect(() => {
    if (assetId) {
      loadAsset();
    } else {
      // Generate QR tag ID for new assets
      generateQRTagId();
    }
  }, [assetId]);

  const loadAsset = async () => {
    try {
      setLoading(true);
      const foundAsset = await collections.assets.find(assetId!);
      setAsset(foundAsset);
      setFormData({
        name: foundAsset.name,
        type: foundAsset.type,
        location: foundAsset.location || "",
        condition: foundAsset.condition,
        notes: foundAsset.notes || "",
        qrTagId: foundAsset.qrTagId || "",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to load asset");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const generateQRTagId = () => {
    const timestamp = Date.now().toString(36);
    const typePrefix = formData.type.substring(0, 3).toUpperCase();
    const qrTagId = `${typePrefix}-${timestamp}`;
    setFormData((prev) => ({ ...prev, qrTagId }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Asset name is required";
    }

    if (!formData.type) {
      newErrors.type = "Asset type is required";
    }

    if (!formData.condition) {
      newErrors.condition = "Asset condition is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      await database.write(async () => {
        if (isEditMode && asset) {
          // Update existing asset
          await asset.update((asset) => {
            asset.name = formData.name.trim();
            asset.type = formData.type;
            asset.location = formData.location.trim() || null;
            asset.condition = formData.condition;
            asset.notes = formData.notes.trim() || null;
            asset.qrTagId = formData.qrTagId.trim() || null;
            asset.synced = false;
          });
        } else {
          // Create new asset
          await collections.assets.create((asset) => {
            asset.name = formData.name.trim();
            asset.type = formData.type;
            asset.location = formData.location.trim() || null;
            asset.condition = formData.condition;
            asset.notes = formData.notes.trim() || null;
            asset.qrTagId = formData.qrTagId.trim() || null;
            asset.synced = false;
          });
        }
      });

      Alert.alert("Success", `Asset ${isEditMode ? "updated" : "created"} successfully`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", `Failed to ${isEditMode ? "update" : "create"} asset`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleTypeChange = (type: AssetType) => {
    setFormData((prev) => ({ ...prev, type }));
    // Regenerate QR tag ID when type changes (for new assets only)
    if (!isEditMode) {
      const timestamp = Date.now().toString(36);
      const typePrefix = type.substring(0, 3).toUpperCase();
      const qrTagId = `${typePrefix}-${timestamp}`;
      setFormData((prev) => ({ ...prev, qrTagId }));
    }
  };

  const renderTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Asset Type *</Text>
      <View style={styles.typeGrid}>
        {Object.values(AssetType).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, formData.type === type && styles.typeButtonSelected]}
            onPress={() => handleTypeChange(type)}
            testID={`type-${type}`}
          >
            <Text
              style={[
                styles.typeButtonText,
                formData.type === type && styles.typeButtonTextSelected,
              ]}
            >
              {type.replace("_", " ").toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
    </View>
  );

  const renderConditionSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Condition *</Text>
      <View style={styles.conditionGrid}>
        {Object.values(AssetCondition).map((condition) => (
          <TouchableOpacity
            key={condition}
            style={[
              styles.conditionButton,
              formData.condition === condition && styles.conditionButtonSelected,
            ]}
            onPress={() => setFormData((prev) => ({ ...prev, condition }))}
            testID={`condition-${condition}`}
          >
            <Text
              style={[
                styles.conditionButtonText,
                formData.condition === condition && styles.conditionButtonTextSelected,
              ]}
            >
              {condition.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.condition && <Text style={styles.errorText}>{errors.condition}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading asset...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{isEditMode ? "Edit Asset" : "Create New Asset"}</Text>

      {/* Asset Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Asset Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={formData.name}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
          placeholder="Enter asset name"
          testID="name-input"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* Asset Type */}
      {renderTypeSelector()}

      {/* Location */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, location: text }))}
          placeholder="Enter location (optional)"
          testID="location-input"
        />
      </View>

      {/* Condition */}
      {renderConditionSelector()}

      {/* Notes */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, notes: text }))}
          placeholder="Enter additional notes (optional)"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          testID="notes-input"
        />
      </View>

      {/* QR Tag ID */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>QR Tag ID</Text>
        <TextInput
          style={styles.input}
          value={formData.qrTagId}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, qrTagId: text }))}
          placeholder="QR tag identifier (optional)"
          testID="qr-tag-input"
        />
        <Text style={styles.helperText}>
          {isEditMode ? "Edit the QR tag ID if needed" : "Auto-generated, but you can customize it"}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          testID="cancel-button"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
          testID="save-button"
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>{isEditMode ? "Update" : "Create"} Asset</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AssetFormScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 16,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
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
  helperText: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
  },
  typeButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  typeButtonText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  typeButtonTextSelected: {
    color: "white",
  },
  conditionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  conditionButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 90,
    alignItems: "center",
  },
  conditionButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  conditionButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  conditionButtonTextSelected: {
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    marginBottom: 32,
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
  buttonDisabled: {
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
});
