import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Road } from "@storage/models";
import { AssetCondition, AssetFilters, AssetSortOptions } from "@/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  AssetList: undefined;
  AssetForm: { assetId?: string };
};

type AssetListNavigationProp = NativeStackNavigationProp<RootStackParamList, "AssetList">;

interface AssetListScreenProps {
  roads: Road[];
}

interface AssetItemProps {
  road: Road;
  onPress: () => void;
}

const AssetItem: React.FC<AssetItemProps> = ({ road, onPress }) => {
  const getConditionColor = (condition: AssetCondition) => {
    const colors = {
      [AssetCondition.EXCELLENT]: "#4CAF50",
      [AssetCondition.GOOD]: "#8BC34A",
      [AssetCondition.FAIR]: "#FFC107",
      [AssetCondition.POOR]: "#FF9800",
      [AssetCondition.CRITICAL]: "#F44336",
    };
    return colors[condition] || "#666";
  };

  return (
    <TouchableOpacity style={styles.assetItem} onPress={onPress}>
      <View style={styles.assetHeader}>
        <Text style={styles.assetName}>{road.name}</Text>
        <View
          style={[styles.conditionBadge, { backgroundColor: getConditionColor(road.condition) }]}
        >
          <Text style={styles.conditionText}>{road.condition.toUpperCase()}</Text>
        </View>
      </View>

      {road.location && <Text style={styles.assetLocation}>{road.location}</Text>}

      {/* Road-specific details */}
      <View style={styles.roadDetails}>
        <Text style={styles.roadSpec}>
          {road.surfaceType} • {road.trafficVolume} traffic
        </Text>
        {road.roadDimensions !== "Dimensions not specified" && (
          <Text style={styles.roadSpec}>{road.roadDimensions}</Text>
        )}
        {road.lanes && (
          <Text style={styles.roadSpec}>
            {road.lanes} lane{road.lanes > 1 ? "s" : ""}
          </Text>
        )}
        {road.speedLimit && <Text style={styles.roadSpec}>{road.speedLimit} km/h</Text>}
      </View>

      {road.notes && (
        <Text style={styles.assetNotes} numberOfLines={2}>
          {road.notes}
        </Text>
      )}

      <View style={styles.assetFooter}>
        <Text style={styles.assetId}>ID: {road.qrTagId || road.id}</Text>
        <Text style={styles.assetDate}>{road.createdAt.toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const AssetListScreen: React.FC<AssetListScreenProps> = ({ roads }) => {
  const navigation = useNavigation<AssetListNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCondition, setFilterCondition] = useState<AssetCondition | "">("");
  const [refreshing, setRefreshing] = useState(false);

  const filteredRoads = useMemo(() => {
    return roads.filter((road) => {
      const matchesSearch =
        road.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (road.location && road.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCondition = filterCondition === "" || road.condition === filterCondition;

      return matchesSearch && matchesCondition;
    });
  }, [roads, searchQuery, filterCondition]);

  const handleRoadPress = (road: Road) => {
    navigation.navigate("AssetForm", { assetId: road.id });
  };

  const handleAddNew = () => {
    navigation.navigate("AssetForm", {});
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Implement refresh logic
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderRoadItem = ({ item }: { item: Road }) => (
    <AssetItem road={item} onPress={() => handleRoadPress(item)} />
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, filterCondition === "" && styles.filterButtonActive]}
        onPress={() => setFilterCondition("")}
      >
        <Text
          style={[styles.filterButtonText, filterCondition === "" && styles.filterButtonTextActive]}
        >
          All
        </Text>
      </TouchableOpacity>
      {Object.values(AssetCondition).map((condition) => (
        <TouchableOpacity
          key={condition}
          style={[styles.filterButton, filterCondition === condition && styles.filterButtonActive]}
          onPress={() => setFilterCondition(condition)}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterCondition === condition && styles.filterButtonTextActive,
            ]}
          >
            {condition.charAt(0).toUpperCase() + condition.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Road Assets</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
          <Text style={styles.addButtonText}>+ Add Road</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search roads..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {renderFilterButtons()}

      <FlatList
        data={filteredRoads}
        renderItem={renderRoadItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || filterCondition !== ""
                ? "No roads match your search criteria"
                : "No roads found. Add your first road asset!"}
            </Text>
            {!searchQuery && filterCondition === "" && (
              <TouchableOpacity style={styles.emptyAddButton} onPress={handleAddNew}>
                <Text style={styles.emptyAddButtonText}>Add Road</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  assetItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  assetName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
  },
  conditionText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  assetLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  roadDetails: {
    marginBottom: 8,
  },
  roadSpec: {
    fontSize: 13,
    color: "#555",
    marginBottom: 2,
  },
  assetNotes: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 8,
  },
  assetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assetId: {
    fontSize: 11,
    color: "#999",
  },
  assetDate: {
    fontSize: 11,
    color: "#999",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  emptyAddButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default AssetListScreen;
