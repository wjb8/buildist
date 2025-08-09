import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { withObservables } from "@nozbe/watermelondb/react";
import { Q } from "@nozbe/watermelondb";
import { Asset } from "@storage/models";
import { collections } from "@storage/database";
import { AssetType, AssetCondition, AssetFilters } from "../types/models";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Navigation types
type RootStackParamList = {
  AssetList: undefined;
  AssetForm: { assetId?: string };
};

type AssetListNavigationProp = NativeStackNavigationProp<RootStackParamList, "AssetList">;

interface AssetListScreenProps {
  assets: Asset[];
}

interface AssetItemProps {
  asset: Asset;
  onPress: () => void;
}

const AssetItem = ({ asset, onPress }: AssetItemProps) => {
  const getConditionColor = (condition: AssetCondition) => {
    switch (condition) {
      case AssetCondition.EXCELLENT:
        return "#4CAF50";
      case AssetCondition.GOOD:
        return "#8BC34A";
      case AssetCondition.FAIR:
        return "#FF9800";
      case AssetCondition.POOR:
        return "#FF5722";
      case AssetCondition.CRITICAL:
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  return (
    <TouchableOpacity style={styles.assetItem} onPress={onPress} testID={`asset-item-${asset.id}`}>
      <View style={styles.assetHeader}>
        <Text style={styles.assetName}>{asset.name}</Text>
        <View
          style={[styles.conditionBadge, { backgroundColor: getConditionColor(asset.condition) }]}
        >
          <Text style={styles.conditionText}>{asset.condition.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.assetType}>{asset.type.replace("_", " ").toUpperCase()}</Text>

      {asset.location && <Text style={styles.assetLocation}>📍 {asset.location}</Text>}

      {asset.notes && (
        <Text style={styles.assetNotes} numberOfLines={2}>
          {asset.notes}
        </Text>
      )}

      <View style={styles.assetFooter}>
        <Text style={styles.assetDate}>Created: {asset.createdAt.toLocaleDateString()}</Text>
        {asset.qrTagId && <Text style={styles.qrTag}>QR: {asset.qrTagId}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const AssetListScreen = ({ assets }: AssetListScreenProps) => {
  const navigation = useNavigation<AssetListNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<AssetType | "">("");
  const [filterCondition, setFilterCondition] = useState<AssetCondition | "">("");
  const [refreshing, setRefreshing] = useState(false);

  // Filter and search assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        searchQuery === "" ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.location && asset.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filterType === "" || asset.type === filterType;
      const matchesCondition = filterCondition === "" || asset.condition === filterCondition;

      return matchesSearch && matchesType && matchesCondition;
    });
  }, [assets, searchQuery, filterType, filterCondition]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real app, you might trigger a sync operation here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAssetPress = (asset: Asset) => {
    navigation.navigate("AssetForm", { assetId: asset.id });
  };

  const handleAddAsset = () => {
    navigation.navigate("AssetForm", {});
  };

  const renderAssetItem = ({ item }: { item: Asset }) => (
    <AssetItem asset={item} onPress={() => handleAssetPress(item)} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState} testID="empty-state">
      <Text style={styles.emptyStateTitle}>No Assets Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery || filterType || filterCondition
          ? "Try adjusting your filters"
          : "Get started by adding your first asset"}
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddAsset}
        testID="add-first-asset-button"
      >
        <Text style={styles.addButtonText}>Add Asset</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search and Filter Section */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search assets..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          testID="search-input"
        />

        <View style={styles.filterRow}>
          {/* Type Filter */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Type:</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                // In a real app, this would show a picker
                Alert.alert("Filter", "Type filter would open here");
              }}
              testID="type-filter-button"
            >
              <Text style={styles.filterButtonText}>{filterType || "All"}</Text>
            </TouchableOpacity>
          </View>

          {/* Condition Filter */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Condition:</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                // In a real app, this would show a picker
                Alert.alert("Filter", "Condition filter would open here");
              }}
              testID="condition-filter-button"
            >
              <Text style={styles.filterButtonText}>{filterCondition || "All"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Asset List */}
      <FlatList
        data={filteredAssets}
        renderItem={renderAssetItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={filteredAssets.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={renderEmptyState}
        testID="asset-list"
      />

      {/* Floating Add Button */}
      {filteredAssets.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddAsset} testID="add-asset-fab">
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// WatermelonDB observable HOC
const enhance = withObservables([], () => ({
  assets: collections.assets.query().observe(),
}));

export default enhance(AssetListScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchSection: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  filterButton: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#333",
  },
  assetItem: {
    backgroundColor: "white",
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  assetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  assetName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  assetType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  assetLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  assetNotes: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  assetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assetDate: {
    fontSize: 12,
    color: "#999",
  },
  qrTag: {
    fontSize: 12,
    color: "#999",
    fontFamily: "monospace",
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
