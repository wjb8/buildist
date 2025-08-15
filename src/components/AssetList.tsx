import { ScrollView, RefreshControl } from "react-native";
import { useRealm, useQuery } from "@realm/react";
import { View } from "./View";
import { Text } from "./Text";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Divider } from "./Divider";
import { layoutStyles } from "@/styles";
import { AssetCondition, TrafficVolume } from "@/types";
import { Road } from "@/storage/models/assets/Road";

interface AssetListProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function AssetList({ onRefresh, refreshing }: AssetListProps) {
  const realm = useRealm();
  const roads = useQuery(Road);
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
        <Text variant="h3" style={[layoutStyles.mb4]}>
          Current Road Assets ({roads.length})
        </Text>

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

            {index < roads.length - 1 && <Divider style={[layoutStyles.mt3]} />}
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
