import React from "react";
import { Modal, ScrollView } from "react-native";
import { View } from "./View";
import { Text } from "./Text";
import { Button } from "./Button";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Divider } from "./Divider";
import { layoutStyles, spacing, colors } from "@/styles";
import { Inspection } from "@/storage/models/Inspection";

interface AllInspectionsProps {
  inspections: Inspection[];
  visible: boolean;
  onClose: () => void;
  onInspectionTap: (inspection: Inspection) => void;
}

export default function AllInspections({
  inspections,
  visible,
  onClose,
  onInspectionTap,
}: AllInspectionsProps) {
  const sortedInspections = [...inspections].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
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
            <Text variant="h3">All Inspections ({inspections.length})</Text>
            <Button variant="secondary" size="small" onPress={onClose}>
              Close
            </Button>
          </View>

          {sortedInspections.length === 0 ? (
            <Card style={[layoutStyles.p4]}>
              <Text variant="body" color="neutral" center>
                No inspections recorded yet.
              </Text>
            </Card>
          ) : (
            sortedInspections.map((inspection, index) => (
              <Card key={inspection._id.toString()} style={[layoutStyles.p3, layoutStyles.mb3]}>
                <View style={[layoutStyles.mb2]}>
                  <Text variant="h4" style={[layoutStyles.mb1]}>
                    {inspection.inspector}
                  </Text>
                  <Text variant="bodySmall" color="neutral">
                    {inspection.timestamp.toLocaleDateString()} at{" "}
                    {inspection.timestamp.toLocaleTimeString()}
                  </Text>
                </View>

                <View row style={[layoutStyles.mb2, { flexWrap: "wrap" }]}>
                  <Badge
                    variant={
                      inspection.score >= 4
                        ? "success"
                        : inspection.score >= 3
                        ? "warning"
                        : "error"
                    }
                    size="small"
                  >
                    Score {inspection.score}
                  </Badge>
                  {inspection.priority && (
                    <Badge
                      variant={
                        inspection.priority === "high"
                          ? "error"
                          : inspection.priority === "medium"
                          ? "warning"
                          : "success"
                      }
                      size="small"
                      style={{ marginLeft: spacing.sm }}
                    >
                      {inspection.priority}
                    </Badge>
                  )}
                  {inspection.maintenanceNeeded && (
                    <Badge variant="error" size="small" style={{ marginLeft: spacing.sm }}>
                      Maintenance
                    </Badge>
                  )}
                  {inspection.photos && inspection.photos.length > 0 && (
                    <Badge variant="secondary" size="small" style={{ marginLeft: spacing.sm }}>
                      {inspection.photos.length} photo{inspection.photos.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </View>

                <Text variant="bodySmall" color="neutral" style={[layoutStyles.mb2]}>
                  Issue: {inspection.issueType ? inspection.issueType : "none"}
                </Text>

                {inspection.description && (
                  <Text variant="bodySmall" style={[layoutStyles.mb2]}>
                    {inspection.description}
                  </Text>
                )}

                <Button
                  variant="secondary"
                  size="small"
                  onPress={() => onInspectionTap(inspection)}
                >
                  View Details
                </Button>

                {index < sortedInspections.length - 1 && <Divider style={[layoutStyles.mt3]} />}
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}
