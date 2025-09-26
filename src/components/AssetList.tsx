import { useMemo, useState } from "react";
import { ScrollView, RefreshControl, Modal } from "react-native";
import { useRealm, useQuery } from "@realm/react";
import { View } from "./View";
import { Text } from "./Text";
import { Button } from "./Button";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Divider } from "./Divider";
import QRCodeDisplay from "./QRCodeDisplay";
import NewInspectionForm from "./NewInspectionForm";
import EditAssetForm from "./EditAssetForm";
import { layoutStyles, colors, spacing } from "@/styles";
import { AssetCondition, TrafficVolume } from "@/types";
import { Road } from "@/storage/models/assets/Road";
import { Inspection } from "@/storage/models/Inspection";
import Realm from "realm";
import {
  defaultAttentionConfig,
  getAttentionFlags,
  computeAttentionScore,
  getAttentionReasonBadges,
} from "@/config/attention";

interface AssetListProps {
  onRefresh?: () => void;
  refreshing?: boolean;
  focusQrTagId?: string;
}

export default function AssetList({ onRefresh, refreshing, focusQrTagId }: AssetListProps) {
  const realm = useRealm();
  const roads = useQuery(Road);
  const allInspections = useQuery(Inspection);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [showQRCodes, setShowQRCodes] = useState(false);
  const [highlightedAssetId, setHighlightedAssetId] = useState<string | null>(null);
  const [mode, setMode] = useState<"attention" | "all">("attention");
  const [editingRoadId, setEditingRoadId] = useState<string | null>(null);

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

  // When focusQrTagId is provided, expand and highlight the matching asset
  if (focusQrTagId && !expandedAssetId) {
    const match = roads.filtered("qrTagId == $0", focusQrTagId)[0] as Road | undefined;
    if (match) {
      const idHex = (match._id as any).toHexString();
      setExpandedAssetId(idHex);
      setHighlightedAssetId(idHex);
      setTimeout(() => setHighlightedAssetId(null), 2000);
    }
  }

  // Precompute latest inspection per asset
  const latestInspectionByAssetId = useMemo(() => {
    const map = new Map<string, Inspection>();
    // Sort once by timestamp desc
    const sorted = [...allInspections].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    for (const insp of sorted) {
      if (!map.has(insp.assetId)) map.set(insp.assetId, insp);
    }
    return map;
  }, [allInspections]);

  // Compute attention metadata and sorting
  const computedRoads = useMemo(() => {
    return roads.map((road) => {
      const idHex = road._id.toHexString();
      const latestInspection = latestInspectionByAssetId.get(idHex) ?? null;
      const flags = getAttentionFlags(road as any, latestInspection, defaultAttentionConfig);
      const attentionScore = computeAttentionScore(
        road as any,
        flags,
        latestInspection,
        defaultAttentionConfig
      );
      return { road, latestInspection, flags, attentionScore };
    });
  }, [roads, latestInspectionByAssetId]);

  const attentionRoads = useMemo(
    () =>
      computedRoads
        .filter(
          (r) => r.flags.overdue || r.flags.dueSoon || r.flags.maintenance || r.flags.poorCondition
        )
        .sort((a, b) => b.attentionScore - a.attentionScore),
    [computedRoads]
  );

  const allRoadsSorted = useMemo(
    () => [...computedRoads].sort((a, b) => b.attentionScore - a.attentionScore),
    [computedRoads]
  );

  const displayed = mode === "attention" ? attentionRoads : allRoadsSorted;

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
        <View style={[layoutStyles.mb2]}>
          <Text variant="h3">
            {mode === "attention"
              ? `Needs Attention (${attentionRoads.length})`
              : `All Assets (${roads.length})`}
          </Text>
        </View>
        <View style={[layoutStyles.flexRow, { flexWrap: "wrap" }, layoutStyles.mb4]}>
          <Button
            variant={mode === "attention" ? "primary" : "secondary"}
            onPress={() => setMode("attention")}
            size="small"
            style={{ marginRight: spacing.sm, marginBottom: spacing.sm }}
          >
            Needs Attention
          </Button>
          <Button
            variant={mode === "all" ? "primary" : "secondary"}
            onPress={() => setMode("all")}
            size="small"
            style={{ marginRight: spacing.sm, marginBottom: spacing.sm }}
          >
            All
          </Button>
          <Button
            variant="secondary"
            onPress={() => setShowQRCodes(!showQRCodes)}
            size="small"
            style={{ marginRight: spacing.sm, marginBottom: spacing.sm }}
          >
            {showQRCodes ? "Hide QR" : "Show QR"}
          </Button>
        </View>

        {mode === "attention" && attentionRoads.length === 0 && (
          <View style={[layoutStyles.mb3]}>
            <Text variant="body" color="neutral" style={[layoutStyles.mb2]}>
              All assets are in good standing.
            </Text>
            <Button variant="secondary" onPress={() => setMode("all")} size="small">
              Show All Assets
            </Button>
          </View>
        )}

        {displayed.map(({ road, latestInspection, flags }, index) => (
          <Card
            key={road._id.toString()}
            style={
              highlightedAssetId === road._id.toHexString()
                ? [layoutStyles.mb3, { borderWidth: 2, borderColor: colors.primary.main }]
                : [layoutStyles.mb3]
            }
          >
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

            {/* Attention reasons */}
            {(() => {
              const reasons = getAttentionReasonBadges(flags);
              if (reasons.length === 0) return null;
              const badgeVariant = (reason: string) => {
                if (reason === "Overdue" || reason === "Maintenance") return "error" as const;
                if (reason === "Due soon" || reason === "Poor condition") return "warning" as const;
                return "secondary" as const;
              };
              return (
                <View row style={[layoutStyles.mb2, { flexWrap: "wrap" }]}>
                  {reasons.map((r) => (
                    <View key={r} style={{ marginRight: 8, marginBottom: 8 }}>
                      <Badge variant={badgeVariant(r)} size="small">
                        {r}
                      </Badge>
                    </View>
                  ))}
                </View>
              );
            })()}

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
              <Button
                variant="secondary"
                size="small"
                style={{ marginLeft: spacing.sm }}
                onPress={() => setEditingRoadId(road._id.toHexString())}
              >
                Edit
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
              {[...allInspections]
                .filter((i) => i.assetId === road._id.toHexString())
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, 3)
                .map((insp) => (
                  <View key={insp._id.toHexString()} style={[layoutStyles.mt1]}>
                    <Text variant="body">
                      {insp.timestamp.toLocaleDateString()} • Score {insp.score}
                      {insp.maintenanceNeeded ? " • maintenance" : ""}
                    </Text>
                    {insp.description && (
                      <Text variant="bodySmall" color="neutral">
                        {insp.description}
                      </Text>
                    )}
                  </View>
                ))}
            </View>

            {index < displayed.length - 1 && <Divider style={[layoutStyles.mt3]} />}
          </Card>
        ))}
      </View>

      <Modal
        visible={!!editingRoadId}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingRoadId(null)}
      >
        {editingRoadId && (
          <EditAssetForm
            road={roads.filtered("_id == $0", new Realm.BSON.ObjectId(editingRoadId))[0] as Road}
            onClose={() => setEditingRoadId(null)}
            onSaved={() => {
              setHighlightedAssetId(editingRoadId);
              setTimeout(() => setHighlightedAssetId(null), 1500);
            }}
          />
        )}
      </Modal>
    </ScrollView>
  );
}
