import React from "react";
import { ScrollView, RefreshControl } from "react-native";
import { withObservables } from "@nozbe/watermelondb/react";
import { collections } from "@/storage/database";
import { View, Text, Card, Badge, Divider } from "@/components";
import { colors, spacing, layoutStyles, textStyles } from "@/styles";
import { AssetCondition, RoadSurfaceType, TrafficVolume } from "@/types";
import type { Road } from "@/storage/models/assets/Road";

interface AssetListProps {
  roads: Road[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

function AssetListComponent({ roads, onRefresh, refreshing }: AssetListProps) {
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
        return "neutral";
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
        return "neutral";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  if (roads.length === 0) {
    return (
      <View center style={[layoutStyles.p4]}>
        <Text variant="h4" color="neutral" center style={[textStyles.mb2]}>
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
      style={[layoutStyles.container]}
      refreshControl={<RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} />}
    >
      <View style={[layoutStyles.p4]}>
        <Text variant="h3" style={[textStyles.mb4]}>
          Current Road Assets ({roads.length})
        </Text>

        {roads.map((road, index) => (
          <Card key={road.id} style={[layoutStyles.mb3]}>
            <View style={[layoutStyles.row, layoutStyles.mb2]}>
              <View style={[layoutStyles.flex1]}>
                <Text variant="h4" style={[textStyles.mb1]}>
                  {road.name}
                </Text>
                {road.location && (
                  <Text variant="body" color="neutral" style={[textStyles.mb1]}>
                    📍 {road.location}
                  </Text>
                )}
              </View>
              <View style={[layoutStyles.alignEnd]}>
                <Badge variant={getConditionColor(road.condition)}>{road.condition}</Badge>
              </View>
            </View>

            <View style={[layoutStyles.row, layoutStyles.mb2]}>
              <View style={[layoutStyles.flex1]}>
                <Text variant="label" color="neutral">
                  Surface Type
                </Text>
                <Text variant="body">{road.surfaceType}</Text>
              </View>
              <View style={[layoutStyles.flex1]}>
                <Text variant="label" color="neutral">
                  Traffic Volume
                </Text>
                <Badge variant={getTrafficVolumeColor(road.trafficVolume)} size="small">
                  {road.trafficVolume}
                </Badge>
              </View>
            </View>

            {(road.length || road.width || road.lanes || road.speedLimit) && (
              <View style={[layoutStyles.row, layoutStyles.mb2]}>
                {road.length && (
                  <View style={[layoutStyles.flex1]}>
                    <Text variant="label" color="neutral">
                      Length
                    </Text>
                    <Text variant="body">{road.length}m</Text>
                  </View>
                )}
                {road.width && (
                  <View style={[layoutStyles.flex1]}>
                    <Text variant="label" color="neutral">
                      Width
                    </Text>
                    <Text variant="body">{road.width}m</Text>
                  </View>
                )}
                {road.lanes && (
                  <View style={[layoutStyles.flex1]}>
                    <Text variant="label" color="neutral">
                      Lanes
                    </Text>
                    <Text variant="body">{road.lanes}</Text>
                  </View>
                )}
                {road.speedLimit && (
                  <View style={[layoutStyles.flex1]}>
                    <Text variant="label" color="neutral">
                      Speed Limit
                    </Text>
                    <Text variant="body">{road.speedLimit} km/h</Text>
                  </View>
                )}
              </View>
            )}

            {road.notes && (
              <View style={[layoutStyles.mb2]}>
                <Text variant="label" color="neutral">
                  Notes
                </Text>
                <Text variant="body">{road.notes}</Text>
              </View>
            )}

            <Divider style={[layoutStyles.my2]} />

            <View style={[layoutStyles.row, layoutStyles.spaceBetween]}>
              <View>
                <Text variant="label" color="neutral">
                  Created
                </Text>
                <Text variant="bodySmall">{formatDate(road.createdAt)}</Text>
              </View>
              <View style={[layoutStyles.alignEnd]}>
                <Text variant="label" color="neutral">
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

export default withObservables([], () => ({
  roads: collections.roads.query().observe(),
}))(AssetListComponent);
