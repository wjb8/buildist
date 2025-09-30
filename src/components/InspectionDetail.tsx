import React, { useState } from "react";
import { Modal, ScrollView, Image, View as RNView, Pressable } from "react-native";
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
                  Condition Score
                </Text>
                <Badge
                  variant={
                    inspection.score >= 4 ? "success" : inspection.score >= 3 ? "warning" : "error"
                  }
                >
                  {inspection.score}/5
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
