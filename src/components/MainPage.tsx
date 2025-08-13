import React, { useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { View, Text, Button, AssetForm, AssetList } from "@/components";
import { colors, spacing, layoutStyles, textStyles, buttonStyles } from "@/styles";

export default function MainPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleAssetCreated = () => {
    setShowForm(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView
      style={[layoutStyles.container]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={[layoutStyles.p4]}>
        <View style={[layoutStyles.mb4]}>
          <Text variant="h2" style={[textStyles.mb2]}>
            Buildist Asset Manager
          </Text>
          <Text variant="body" color="neutral" style={[textStyles.mb4]}>
            Manage your road infrastructure assets offline
          </Text>

          <Button
            variant={showForm ? "secondary" : "primary"}
            onPress={() => setShowForm(!showForm)}
            style={[buttonStyles.mb4]}
          >
            {showForm ? "Hide Form" : "Add New Road Asset"}
          </Button>
        </View>

        {showForm && (
          <View style={[layoutStyles.mb4]}>
            <AssetForm onAssetCreated={handleAssetCreated} />
          </View>
        )}

        <AssetList onRefresh={handleRefresh} refreshing={refreshing} />
      </View>
    </ScrollView>
  );
}
