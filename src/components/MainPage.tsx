import React, { useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { View } from "./View";
import { Text } from "./Text";
import { Button } from "./Button";
import AssetForm from "./AssetForm";
import AssetList from "./AssetList";
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
      style={[layoutStyles.flex]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={[layoutStyles.p4]}>
        <View style={[layoutStyles.mb4]}>
          <Text variant="h2" style={[layoutStyles.mb2]}>
            Buildist Asset Manager
          </Text>
          <Text variant="body" color="neutral" style={[layoutStyles.mb4]}>
            Manage your road infrastructure assets offline
          </Text>

          <Button
            variant={showForm ? "secondary" : "primary"}
            onPress={() => setShowForm(!showForm)}
            style={[layoutStyles.mb4]}
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
