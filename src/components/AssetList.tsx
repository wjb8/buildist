import { useMemo, useState } from "react";
import { ScrollView, RefreshControl, Modal, Pressable } from "react-native";
import { useRealm, useQuery } from "@realm/react";
import { FontAwesome } from "@expo/vector-icons";
import { View } from "./View";
import { Text } from "./Text";
import { Button } from "./Button";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Divider } from "./Divider";
import { Input } from "./Input";
import Select from "./Select";
import QRCodeDisplay from "./QRCodeDisplay";
import NewInspectionForm from "./NewInspectionForm";
import EditAssetForm from "./EditAssetForm";
import InspectionDetail from "./InspectionDetail";
import AllInspections from "./AllInspections";
import { layoutStyles, colors, spacing } from "@/styles";
import { AssetCondition, AssetType } from "@/types/asset";
import { Asset } from "@/storage/models/assets/Asset";
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
  const assets = useQuery(Asset);
  const allInspections = useQuery(Inspection);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [showQRCodes, setShowQRCodes] = useState<Set<string>>(new Set());
  const [highlightedAssetId, setHighlightedAssetId] = useState<string | null>(null);
  const [mode, setMode] = useState<"attention" | "all">("attention");
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [showAllInspections, setShowAllInspections] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType | "all">("all");

  const getConditionColor = (condition: AssetCondition) => {
    switch (condition) {
      case AssetCondition.GOOD:
        return "success";
      case AssetCondition.FAIR:
        return "warning";
      case AssetCondition.POOR:
        return "error";
      default:
        return "secondary";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const getAssetTypeLabel = (type: AssetType) => {
    switch (type) {
      case AssetType.ROAD:
        return "Road";
      case AssetType.VEHICLE:
        return "Vehicle";
      case AssetType.BRIDGE:
        return "Bridge";
      case AssetType.SIDEWALK:
        return "Sidewalk";
      case AssetType.STREET_LIGHT:
        return "Street Light";
      case AssetType.TRAFFIC_SIGNAL:
        return "Traffic Signal";
      case AssetType.OTHER:
        return "Other";
      default:
        return type;
    }
  };

  if (focusQrTagId && !expandedAssetId) {
    const match = assets.filtered("qrTagId == $0", focusQrTagId)[0] as Asset | undefined;
    if (match) {
      const idHex = match._id.toHexString();
      setExpandedAssetId(idHex);
      setHighlightedAssetId(idHex);
      setTimeout(() => setHighlightedAssetId(null), 2000);
    }
  }

  const latestInspectionByAssetId = useMemo(() => {
    const map = new Map<string, Inspection>();
    const sorted = [...allInspections].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    for (const insp of sorted) {
      if (!map.has(insp.assetId)) map.set(insp.assetId, insp);
    }
    return map;
  }, [allInspections]);

  const computedAssets = useMemo(() => {
    return assets.map((asset) => {
      const idHex = asset._id.toHexString();
      const latestInspection = latestInspectionByAssetId.get(idHex) ?? null;
      const flags = getAttentionFlags(asset, latestInspection, defaultAttentionConfig);
      const attentionScore = computeAttentionScore(
        asset,
        flags,
        latestInspection,
        defaultAttentionConfig
      );
      return { asset, latestInspection, flags, attentionScore };
    });
  }, [assets, latestInspectionByAssetId]);

  const attentionAssets = useMemo(
    () =>
      computedAssets
        .filter(
          (a) => a.flags.overdue || a.flags.dueSoon || a.flags.maintenance || a.flags.poorCondition
        )
        .sort((a, b) => b.attentionScore - a.attentionScore),
    [computedAssets]
  );

  const allAssetsSorted = useMemo(
    () => [...computedAssets].sort((a, b) => b.attentionScore - a.attentionScore),
    [computedAssets]
  );

  const filteredAssets = useMemo(() => {
    let filtered = mode === "attention" ? attentionAssets : allAssetsSorted;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const asset = item.asset;
        return (
          asset.name.toLowerCase().includes(query) ||
          (asset.location && asset.location.toLowerCase().includes(query)) ||
          (asset.qrTagId && asset.qrTagId.toLowerCase().includes(query)) ||
          asset.type.toLowerCase().includes(query)
        );
      });
    }

    if (assetTypeFilter !== "all") {
      filtered = filtered.filter((item) => item.asset.type === assetTypeFilter);
    }

    return filtered;
  }, [mode, attentionAssets, allAssetsSorted, searchQuery, assetTypeFilter]);

  if (assets.length === 0) {
    return (
      <View center style={[layoutStyles.centerContainer]}>
        <Text variant="h4" color="neutral" center style={[layoutStyles.mb2]}>
          No Assets Found
        </Text>
        <Text variant="body" color="neutral" center>
          Create your first asset using the form above
        </Text>
      </View>
    );
  }

  const assetTypeOptions = [
    { value: "all", label: "All Types" },
    { value: AssetType.ROAD, label: "Roads" },
    { value: AssetType.VEHICLE, label: "Vehicles" },
    { value: AssetType.BRIDGE, label: "Bridges" },
    { value: AssetType.SIDEWALK, label: "Sidewalks" },
    { value: AssetType.STREET_LIGHT, label: "Street Lights" },
    { value: AssetType.TRAFFIC_SIGNAL, label: "Traffic Signals" },
    { value: AssetType.OTHER, label: "Other" },
  ];

  return (
    <ScrollView
      style={[layoutStyles.flex]}
      refreshControl={<RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} />}
    >
      <View style={[layoutStyles.p4]}>
        <View style={[layoutStyles.mb2]}>
          <Text variant="h3">{mode === "attention" ? "Needs Attention" : "All Assets"}</Text>
        </View>

        <View style={[layoutStyles.mb3, { flexDirection: "row", gap: spacing.sm }]}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ marginBottom: 0 }}
            />
          </View>
          <View style={{ width: 140 }}>
            <Select
              value={assetTypeFilter}
              onChange={(value) => setAssetTypeFilter(value as AssetType | "all")}
              options={assetTypeOptions}
            />
          </View>
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
        </View>

        {mode === "attention" && attentionAssets.length === 0 && (
          <View style={[layoutStyles.mb3]}>
            <Text variant="body" color="neutral" style={[layoutStyles.mb2]}>
              All assets are in good standing.
            </Text>
            <Button variant="secondary" onPress={() => setMode("all")} size="small">
              Show All Assets
            </Button>
          </View>
        )}

        {filteredAssets.map((item, index) => {
          const { asset, latestInspection, flags } = item;
          return (
            <Card
              key={asset._id.toString()}
              style={
                highlightedAssetId === asset._id.toHexString()
                  ? [layoutStyles.mb3, { borderWidth: 2, borderColor: colors.primary.main }]
                  : [layoutStyles.mb3]
              }
            >
              <View row style={[layoutStyles.mb2]}>
                <View style={[layoutStyles.flex]}>
                  <View row style={[layoutStyles.mb1, { gap: spacing.xs }]}>
                    <Badge variant="secondary" size="small">
                      {getAssetTypeLabel(asset.type as AssetType)}
                    </Badge>
                    <Text variant="h4">{asset.name}</Text>
                  </View>
                  {asset.location && (
                    <Text variant="body" color="neutral" style={[layoutStyles.mb1]}>
                      📍 {asset.location}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Badge variant={getConditionColor(asset.condition)}>
                    {`Condition: ${
                      asset.condition === AssetCondition.GOOD
                        ? "Good"
                        : asset.condition === AssetCondition.FAIR
                        ? "Fair"
                        : "Poor"
                    }`}
                  </Badge>
                </View>
              </View>

              {(() => {
                const reasons = getAttentionReasonBadges(flags);
                if (reasons.length === 0) return null;
                const badgeVariant = (reason: string) => {
                  if (reason === "Overdue" || reason === "Maintenance") return "error" as const;
                  if (reason === "Condition: Poor") return "error" as const;
                  if (reason === "Due soon") return "warning" as const;
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

              {asset.notes && (
                <View style={[layoutStyles.mb2]}>
                  <Text variant="bodySmall" color="neutral">
                    Notes
                  </Text>
                  <Text variant="body">{asset.notes}</Text>
                </View>
              )}

              {showQRCodes.has(asset._id.toHexString()) && asset.qrTagId && (
                <View style={[layoutStyles.mb3]}>
                  <Divider style={[layoutStyles.mb2]} />
                  <QRCodeDisplay qrTagId={asset.qrTagId} assetName={asset.name} size={150} />
                </View>
              )}

              <Divider style={[layoutStyles.my2]} />

              <View spaceBetween style={[layoutStyles.mb2]}>
                <View>
                  <Text variant="bodySmall" color="neutral">
                    Created {formatDate(asset.createdAt)}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  layoutStyles.mt2,
                  { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
                ]}
              >
                <Button
                  variant={expandedAssetId === asset._id.toHexString() ? "secondary" : "primary"}
                  onPress={() =>
                    setExpandedAssetId(
                      expandedAssetId === asset._id.toHexString() ? null : asset._id.toHexString()
                    )
                  }
                  size="small"
                >
                  {expandedAssetId === asset._id.toHexString()
                    ? "Hide Inspection"
                    : "Add Inspection"}
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onPress={() => setEditingAssetId(asset._id.toHexString())}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onPress={() => setShowAllInspections(asset._id.toHexString())}
                >
                  View All
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onPress={() => {
                    const assetId = asset._id.toHexString();
                    setShowQRCodes((prev) => {
                      const newSet = new Set(prev);
                      if (newSet.has(assetId)) {
                        newSet.delete(assetId);
                      } else {
                        newSet.add(assetId);
                      }
                      return newSet;
                    });
                  }}
                >
                  <View row center style={{ gap: spacing.xs }}>
                    <FontAwesome name="qrcode" size={16} color={colors.primary.main} />
                  </View>
                </Button>
              </View>

              {expandedAssetId === asset._id.toHexString() && (
                <NewInspectionForm
                  assetId={asset._id.toHexString()}
                  onCreated={() => setExpandedAssetId(null)}
                />
              )}

              <View style={[layoutStyles.mt2]}>
                <Text variant="bodySmall" color="neutral">
                  Recent Inspections
                </Text>
                {[...allInspections]
                  .filter((i) => i.assetId === asset._id.toHexString())
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .slice(0, 3)
                  .map((insp) => (
                    <Pressable
                      key={insp._id.toHexString()}
                      onPress={() => setSelectedInspection(insp)}
                      style={[
                        layoutStyles.mt1,
                        {
                          padding: spacing.md,
                          backgroundColor: colors.neutral.lightest,
                          borderRadius: spacing.md,
                          borderWidth: 1,
                          borderColor: colors.border.light,
                        },
                      ]}
                    >
                      <Text variant="body">{insp.timestamp.toLocaleDateString()}</Text>
                      <View
                        row
                        style={{ marginTop: spacing.xs, flexWrap: "wrap", gap: spacing.xs }}
                      >
                        <Badge
                          variant={
                            insp.score >= 4 ? "success" : insp.score >= 3 ? "warning" : "error"
                          }
                          size="small"
                        >
                          {`Condition: ${
                            insp.score >= 4 ? "Good" : insp.score >= 3 ? "Fair" : "Poor"
                          }`}
                        </Badge>
                        {insp.issueType && (
                          <Badge
                            variant={
                              insp.issueType === "potholes"
                                ? "error"
                                : insp.issueType === "cracks" || insp.issueType === "drainage"
                                ? "warning"
                                : "secondary"
                            }
                            size="small"
                          >
                            {`Issue: ${
                              insp.issueType === "potholes"
                                ? "Potholes"
                                : insp.issueType === "cracks"
                                ? "Cracks"
                                : insp.issueType === "drainage"
                                ? "Drainage"
                                : "Other"
                            }`}
                          </Badge>
                        )}
                        {insp.maintenanceNeeded && (
                          <Badge variant="error" size="small">
                            Maintenance
                          </Badge>
                        )}
                        {insp.priority && (
                          <Badge
                            variant={
                              insp.priority === "high"
                                ? "error"
                                : insp.priority === "medium"
                                ? "warning"
                                : "success"
                            }
                            size="small"
                          >
                            {`Priority: ${insp.priority}`}
                          </Badge>
                        )}
                        {insp.photos && insp.photos.length > 0 && (
                          <Badge variant="secondary" size="small">
                            {`Photos: ${insp.photos.length}`}
                          </Badge>
                        )}
                      </View>
                      {insp.description && (
                        <Text variant="bodySmall" color="neutral">
                          {insp.description}
                        </Text>
                      )}
                      <Text variant="bodySmall" color="primary" style={{ marginTop: spacing.xs }}>
                        Tap to view details
                      </Text>
                    </Pressable>
                  ))}
              </View>

              {index < filteredAssets.length - 1 && <Divider style={[layoutStyles.mt3]} />}
            </Card>
          );
        })}
      </View>

      <Modal
        visible={!!editingAssetId}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingAssetId(null)}
      >
        {editingAssetId && (
          <EditAssetForm
            asset={
              assets.filtered(
                "_id == $0",
                new Realm.BSON.ObjectId(editingAssetId)
              )[0] as Asset
            }
            onClose={() => setEditingAssetId(null)}
            onSaved={() => {
              setHighlightedAssetId(editingAssetId);
              setTimeout(() => setHighlightedAssetId(null), 1500);
            }}
          />
        )}
      </Modal>

      <InspectionDetail
        inspection={selectedInspection}
        visible={!!selectedInspection}
        onClose={() => setSelectedInspection(null)}
      />

      {showAllInspections && (
        <AllInspections
          inspections={allInspections.filter((i) => i.assetId === showAllInspections)}
          visible={!!showAllInspections}
          onClose={() => setShowAllInspections(null)}
          onInspectionTap={setSelectedInspection}
        />
      )}
    </ScrollView>
  );
}
