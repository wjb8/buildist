import React, { useRef, useState } from "react";
import { Modal, ScrollView, Image, View as RNView, Pressable, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import Realm from "realm";
import { getRealm } from "@/storage/realm";
import { View } from "./View";
import { Text } from "./Text";
import { Button } from "./Button";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Divider } from "./Divider";
import { layoutStyles, spacing, colors } from "@/styles";
import { Inspection } from "@/storage/models/Inspection";

interface InspectionDetailProps {
  inspection: Inspection | null;
  visible: boolean;
  onClose: () => void;
}

export default function InspectionDetail({ inspection, visible, onClose }: InspectionDetailProps) {
  const [expandedPhotoUri, setExpandedPhotoUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermissionStatus, requestMediaPermission] = MediaLibrary.usePermissions();
  const [isSaving, setIsSaving] = useState(false);
  const cameraRef = useRef<any>(null);
  const [showAddPhotoOptions, setShowAddPhotoOptions] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryAssets, setGalleryAssets] = useState<any[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  if (!inspection) return null;

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const getIssueTypeLabel = (issueType?: string) => {
    switch (issueType) {
      case "none":
        return "None";
      case "potholes":
        return "Potholes";
      case "cracks":
        return "Cracks";
      case "drainage":
        return "Drainage";
      case "other":
        return "Other";
      default:
        return "Not specified";
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <ScrollView
          style={[layoutStyles.flex]}
          contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
        >
          <View style={[layoutStyles.p4]}>
            <View
              style={[
                layoutStyles.mb4,
                { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
              ]}
            >
              <Text variant="h3">Inspection Details</Text>
              <Button variant="secondary" size="small" onPress={onClose}>
                Close
              </Button>
            </View>

            <Card style={[layoutStyles.p3, layoutStyles.mb3]}>
              <View style={[layoutStyles.mb3]}>
                <Text variant="h4" style={[layoutStyles.mb2]}>
                  Inspector: {inspection.inspector}
                </Text>
                <Text variant="bodySmall" color="neutral">
                  {inspection.timestamp.toLocaleDateString()} at{" "}
                  {inspection.timestamp.toLocaleTimeString()}
                </Text>
              </View>

              <Divider style={[layoutStyles.my3]} />

              <View style={[layoutStyles.mb3]}>
                <Text variant="bodySmall" color="neutral" style={[layoutStyles.mb1]}>
                  Condition
                </Text>
                <Badge
                  variant={
                    inspection.score >= 4 ? "success" : inspection.score >= 3 ? "warning" : "error"
                  }
                >
                  {inspection.score >= 4 ? "Good" : inspection.score >= 3 ? "Fair" : "Poor"}
                </Badge>
              </View>

              {inspection.issueType && (
                <View style={[layoutStyles.mb3]}>
                  <Text variant="bodySmall" color="neutral" style={[layoutStyles.mb1]}>
                    Issue Type
                  </Text>
                  <Text variant="body">{getIssueTypeLabel(inspection.issueType)}</Text>
                </View>
              )}

              {inspection.priority && (
                <View style={[layoutStyles.mb3]}>
                  <Text variant="bodySmall" color="neutral" style={[layoutStyles.mb1]}>
                    Priority
                  </Text>
                  <Badge variant={getPriorityColor(inspection.priority)}>
                    {inspection.priority}
                  </Badge>
                </View>
              )}

              {inspection.maintenanceNeeded && (
                <View style={[layoutStyles.mb3]}>
                  <Badge variant="error">Maintenance Needed</Badge>
                </View>
              )}

              {inspection.description && (
                <View style={[layoutStyles.mb3]}>
                  <Text variant="bodySmall" color="neutral" style={[layoutStyles.mb1]}>
                    Notes
                  </Text>
                  <Text variant="body">{inspection.description}</Text>
                </View>
              )}

              {inspection.nextDue && (
                <View style={[layoutStyles.mb3]}>
                  <Text variant="bodySmall" color="neutral" style={[layoutStyles.mb1]}>
                    Next Due
                  </Text>
                  <Text variant="body">{inspection.nextDue.toLocaleDateString()}</Text>
                </View>
              )}

              <View style={[layoutStyles.mt2]}>
                <Button
                  variant="secondary"
                  onPress={() => setShowAddPhotoOptions(true)}
                  size="small"
                >
                  Add Photo
                </Button>
              </View>
            </Card>

            {inspection.photos && inspection.photos.length > 0 && (
              <Card style={[layoutStyles.p3]}>
                <Text variant="h4" style={[layoutStyles.mb3]}>
                  Photos ({inspection.photos.length})
                </Text>
                <RNView style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {inspection.photos.map((uri, index) => (
                    <Pressable key={index} onPress={() => setExpandedPhotoUri(uri)}>
                      <Image
                        source={{ uri }}
                        style={{ width: 120, height: 120, borderRadius: 8 }}
                      />
                    </Pressable>
                  ))}
                </RNView>
              </Card>
            )}
          </View>
        </ScrollView>
      </Modal>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCamera(false)}
      >
        <RNView style={[layoutStyles.flex]}>
          <CameraView ref={cameraRef} style={[layoutStyles.flex]} facing="back">
            <RNView style={{ position: "absolute", bottom: 40, left: 0, right: 0 }}>
              <View row style={[layoutStyles.rowCenter]}>
                <Button variant="secondary" onPress={() => setShowCamera(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  style={[layoutStyles.ml2]}
                  onPress={async () => {
                    try {
                      // Ensure permissions
                      if (!cameraPermission?.granted) {
                        const cam = await requestCameraPermission();
                        if (!cam.granted) return;
                      }
                      if (!mediaPermissionStatus?.granted) {
                        const med = await requestMediaPermission();
                        if (!med.granted) return;
                      }

                      // Take picture (same approach as NewInspectionForm)
                      if (!cameraRef.current) return;
                      const result = await cameraRef.current.takePictureAsync({
                        quality: 0.7,
                        skipProcessing: true,
                      });
                      if (!result?.uri) return;
                      await MediaLibrary.saveToLibraryAsync(result.uri);
                      const uri = result.uri;
                      setIsSaving(true);
                      const realm = await getRealm();
                      realm.write(() => {
                        const found = realm.objectForPrimaryKey<Inspection>(
                          "Inspection",
                          inspection!._id
                        );
                        if (!found) throw new Error("Inspection not found");
                        // Append photo URI
                        (found.photos as unknown as string[]).push(uri);
                        found.updatedAt = new Date();
                        found.synced = false;
                      });
                      setShowCamera(false);
                    } catch (e) {
                      console.error("Failed to add photo to inspection", e);
                      Alert.alert("Error", "Could not add photo. Please try again.");
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                >
                  Capture
                </Button>
              </View>
            </RNView>
          </CameraView>
        </RNView>
      </Modal>

      {/* Add Photo Options Modal */}
      <Modal
        visible={showAddPhotoOptions}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddPhotoOptions(false)}
      >
        <RNView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center" }}>
          <Card style={[layoutStyles.p3, { marginHorizontal: spacing.lg }]}>
            <Text variant="h4" style={[layoutStyles.mb2]}>
              Add Photo
            </Text>
            <Button
              variant="primary"
              style={[layoutStyles.mb2]}
              onPress={async () => {
                try {
                  if (!cameraPermission?.granted) {
                    const cam = await requestCameraPermission();
                    if (!cam.granted) return;
                  }
                  if (!mediaPermissionStatus?.granted) {
                    const med = await requestMediaPermission();
                    if (!med.granted) return;
                  }
                  setShowAddPhotoOptions(false);
                  setShowCamera(true);
                } catch {}
              }}
            >
              Take Photo
            </Button>
            <Button
              variant="secondary"
              onPress={async () => {
                try {
                  if (!mediaPermissionStatus?.granted) {
                    const med = await requestMediaPermission();
                    if (!med.granted) return;
                  }
                  setIsLoadingGallery(true);
                  const assets = await MediaLibrary.getAssetsAsync({
                    first: 40,
                    sortBy: MediaLibrary.SortBy.creationTime as any,
                    mediaType: [MediaLibrary.MediaType.photo],
                  });
                  setGalleryAssets(assets.assets || []);
                  setShowAddPhotoOptions(false);
                  setShowGallery(true);
                } catch (e) {
                } finally {
                  setIsLoadingGallery(false);
                }
              }}
            >
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
        </RNView>
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
            <RNView style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {galleryAssets.map((asset) => (
                <Pressable
                  key={asset.id}
                  onPress={async () => {
                    try {
                      const info = await MediaLibrary.getAssetInfoAsync(asset.id);
                      const uri = (info as any).localUri || asset.uri;
                      if (uri) {
                        const realm = await getRealm();
                        realm.write(() => {
                          const found = realm.objectForPrimaryKey<Inspection>(
                            "Inspection",
                            inspection!._id
                          );
                          if (!found) throw new Error("Inspection not found");
                          (found.photos as unknown as string[]).push(uri);
                          found.updatedAt = new Date();
                          found.synced = false;
                        });
                        setShowGallery(false);
                      }
                    } catch (e) {}
                  }}
                  style={{ marginRight: spacing.sm, marginBottom: spacing.sm }}
                >
                  <Image
                    source={{ uri: asset.uri }}
                    style={{ width: 100, height: 100, borderRadius: 6 }}
                  />
                </Pressable>
              ))}
            </RNView>
            <View style={[layoutStyles.mt2]}>
              <Button variant="secondary" onPress={() => setShowGallery(false)}>
                Close
              </Button>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Photo Expansion Modal */}
      <Modal
        visible={!!expandedPhotoUri}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setExpandedPhotoUri(null)}
      >
        <RNView
          style={{
            flex: 1,
            backgroundColor: "black",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {expandedPhotoUri && (
            <Image
              source={{ uri: expandedPhotoUri }}
              style={{ width: "100%", height: "100%", resizeMode: "contain" }}
            />
          )}
          <Button
            variant="secondary"
            onPress={() => setExpandedPhotoUri(null)}
            style={{
              position: "absolute",
              top: 60,
              right: 20,
            }}
          >
            Close
          </Button>
        </RNView>
      </Modal>
    </>
  );
}
