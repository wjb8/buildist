import { useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { useRealm, useQuery } from "@realm/react";
import { View } from "./View";
import { Text } from "./Text";
import { Button } from "./Button";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Divider } from "./Divider";
import QRCodeDisplay from "./QRCodeDisplay";
import NewInspectionForm from "./NewInspectionForm";
import { layoutStyles } from "@/styles";
import { AssetCondition, TrafficVolume } from "@/types";
import { Road } from "@/storage/models/assets/Road";
import { Inspection } from "@/storage/models/Inspection";

interface AssetListProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function AssetList({ onRefresh, refreshing }: AssetListProps) {
  const realm = useRealm();
  const roads = useQuery(Road);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [showQRCodes, setShowQRCodes] = useState(false);
  const getConditionColor = (condition: AssetCondition) => {
    switch (condition) {
      case AssetCondition.EXCELLENT:
        return "success";
      case AssetCondition.GOOD:
        return "success";
      case AssetCondition.FAIR:
        return "warning";
      case AssetCondition.POOR:
        return "error";
      case AssetCondition.CRITICAL:
        return "error";
      default:
        return "secondary";
    }
  };

  const getTrafficVolumeColor = (volume: TrafficVolume) => {
    switch (volume) {
      case TrafficVolume.LOW:
        return "success";
      case TrafficVolume.MEDIUM:
        return "warning";
      case TrafficVolume.HIGH:
        return "warning";
      case TrafficVolume.VERY_HIGH:
        return "error";
      default:
        return "secondary";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  if (roads.length === 0) {
    return (
      <View center style={[layoutStyles.centerContainer]}>
        <Text variant="h4" color="neutral" center style={[layoutStyles.mb2]}>
          No Road Assets Found
        </Text>
        <Text variant="body" color="neutral" center>
          Create your first road asset using the form above
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[layoutStyles.flex]}
      refreshControl={<RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} />}
    >
      <View style={[layoutStyles.p4]}>
        <View style={[layoutStyles.flexRow, layoutStyles.rowSpaceBetween, layoutStyles.mb4]}>
          <Text variant="h3">Current Road Assets ({roads.length})</Text>
          <Button
            variant="secondary"
            onPress={() => setShowQRCodes(!showQRCodes)}
            style={{ paddingHorizontal: 12 }}
          >
            {showQRCodes ? "Hide QR" : "Show QR"}
          </Button>
        </View>

        {roads.map((road, index) => (
          <Card key={road._id.toString()} style={[layoutStyles.mb3]}>
            <View row style={[layoutStyles.mb2]}>
              <View style={[layoutStyles.flex]}>
                <Text variant="h4" style={[layoutStyles.mb1]}>
                  {road.name}
                </Text>
                {road.location && (
                  <Text variant="body" color="neutral" style={[layoutStyles.mb1]}>
                    📍 {road.location}
                  </Text>
                )}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Badge variant={getConditionColor(road.condition)}>{road.condition}</Badge>
              </View>
            </View>

            <View row style={[layoutStyles.mb2]}>
              <View style={[layoutStyles.flex]}>
                <Text variant="bodySmall" color="neutral">
                  Surface Type
                </Text>
                <Text variant="body">{road.surfaceType}</Text>
              </View>
              <View style={[layoutStyles.flex]}>
                <Text variant="bodySmall" color="neutral">
                  Traffic Volume
                </Text>
                <Badge variant={getTrafficVolumeColor(road.trafficVolume)} size="small">
                  {road.trafficVolume}
                </Badge>
              </View>
            </View>

            {(road.length || road.width || road.lanes || road.speedLimit) && (
              <View row style={[layoutStyles.mb2]}>
                {road.length && (
                  <View style={[layoutStyles.flex]}>
                    <Text variant="bodySmall" color="neutral">
                      Length
                    </Text>
                    <Text variant="body">{road.length}m</Text>
                  </View>
                )}
                {road.width && (
                  <View style={[layoutStyles.flex]}>
                    <Text variant="bodySmall" color="neutral">
                      Width
                    </Text>
                    <Text variant="body">{road.width}m</Text>
                  </View>
                )}
                {road.lanes && (
                  <View style={[layoutStyles.flex]}>
                    <Text variant="bodySmall" color="neutral">
                      Lanes
                    </Text>
                    <Text variant="body">{road.lanes}</Text>
                  </View>
                )}
                {road.speedLimit && (
                  <View style={[layoutStyles.flex]}>
                    <Text variant="bodySmall" color="neutral">
                      Speed Limit
                    </Text>
                    <Text variant="body">{road.speedLimit} km/h</Text>
                  </View>
                )}
              </View>
            )}

            {road.notes && (
              <View style={[layoutStyles.mb2]}>
                <Text variant="bodySmall" color="neutral">
                  Notes
                </Text>
                <Text variant="body">{road.notes}</Text>
              </View>
            )}

            {showQRCodes && road.qrTagId && (
              <View style={[layoutStyles.mb3]}>
                <Divider style={[layoutStyles.mb2]} />
                <QRCodeDisplay qrTagId={road.qrTagId} assetName={road.name} size={150} />
              </View>
            )}

            <Divider style={[layoutStyles.my2]} />

            <View spaceBetween style={[layoutStyles.mb2]}>
              <View>
                <Text variant="bodySmall" color="neutral">
                  Created
                </Text>
                <Text variant="bodySmall">{formatDate(road.createdAt)}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text variant="bodySmall" color="neutral">
                  QR Tag
                </Text>
                <Text variant="bodySmall" color="neutral">
                  {road.qrTagId || "Auto-generated"}
                </Text>
              </View>
            </View>

            <View row style={[layoutStyles.mt2]}>
              <Button
                variant={expandedAssetId === road._id.toHexString() ? "secondary" : "primary"}
                onPress={() =>
                  setExpandedAssetId(
                    expandedAssetId === road._id.toHexString() ? null : road._id.toHexString()
                  )
                }
                size="small"
              >
                {expandedAssetId === road._id.toHexString() ? "Hide Inspection" : "Add Inspection"}
              </Button>
            </View>

            {expandedAssetId === road._id.toHexString() && (
              <NewInspectionForm
                assetId={road._id.toHexString()}
                onCreated={() => setExpandedAssetId(null)}
              />
            )}

            {/* Inspections list */}
            <View style={[layoutStyles.mt2]}>
              <Text variant="bodySmall" color="neutral">
                Recent Inspections
              </Text>
              {useQuery(Inspection)
                .filtered("assetId == $0", road._id.toHexString())
                .sorted("timestamp", true)
                .slice(0, 3)
                .map((insp: Inspection & any) => (
                  <View key={insp._id.toHexString()} style={[layoutStyles.mt1]}>
                    <Text variant="body">
                      {insp.timestamp.toLocaleDateString()} • Score {insp.score}{" "}
                      {insp.maintenanceNeeded ? "• maintenance" : ""}
                    </Text>
                    {insp.description && (
                      <Text variant="bodySmall" color="neutral">
                        {insp.description}
                      </Text>
                    )}
                  </View>
                ))}
            </View>

            {index < roads.length - 1 && <Divider style={[layoutStyles.mt3]} />}
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
