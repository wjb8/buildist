import { useState } from "react";
import {
  ScrollView,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { View } from "./View";
import { Text } from "./Text";
import { Button } from "./Button";
import AssetForm from "./AssetForm";
import AssetList from "./AssetList";
import QRScanner from "./QRScanner";
import { colors, spacing, layoutStyles, textStyles, buttonStyles } from "@/styles";
import { Road } from "@/storage/models/assets/Road";
import { QRService } from "@/services/QRService";

interface MainPageProps {
  onLogout: () => void;
}

export default function MainPage({ onLogout }: MainPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleAssetCreated = () => {
    setShowForm(false);
  };

  const handleQRCodeScanned = async (qrTagId: string) => {
    console.log("Processing scanned QR code:", qrTagId);

    const result = await QRService.scanQRCode(qrTagId);
    setShowQRScanner(false);

    if (result.success && result.asset) {
      // Collapse form if open and highlight the asset in list
      setShowForm(false);
      Alert.alert("Asset Found", `Opening ${result.asset.name}`);
      // Pass focus via state flag by updating the refresh key
      setFocusQrTag(result.asset.qrTagId || qrTagId);
    } else {
      Alert.alert("Asset Not Found", result.message, [
        {
          text: "Try Again",
          onPress: () => setShowQRScanner(true),
        },
        {
          text: "Cancel",
          onPress: () => setShowQRScanner(false),
        },
      ]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const [focusQrTag, setFocusQrTag] = useState<string | undefined>(undefined);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={spacing.xl}
      style={[layoutStyles.flex]}
    >
      <ScrollView
        style={[layoutStyles.flex]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[layoutStyles.p4]}>
          <View style={[layoutStyles.mb4]}>
            <View
              style={[
                { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
                layoutStyles.mb2,
              ]}
            >
              <Text variant="h2">Buildist Asset Manager</Text>
              <Button
                variant="primary"
                onPress={onLogout}
                style={{ paddingHorizontal: spacing.sm }}
              >
                Logout
              </Button>
            </View>
            <Text variant="body" color="neutral" style={[layoutStyles.mb4]}>
              Manage your road infrastructure assets offline
            </Text>

            <View style={[layoutStyles.flexRow, layoutStyles.rowSpaceBetween, layoutStyles.mb4]}>
              <Button
                variant={showForm ? "secondary" : "primary"}
                onPress={() => setShowForm(!showForm)}
                style={[layoutStyles.flex, layoutStyles.mr2]}
              >
                {showForm ? "Hide Form" : "Add Asset"}
              </Button>

              <Button
                variant="primary"
                onPress={() => setShowQRScanner(true)}
                style={[layoutStyles.flex, layoutStyles.ml2]}
              >
                Scan QR Code
              </Button>
            </View>
          </View>

          {showForm && (
            <View style={[layoutStyles.mb4]}>
              <AssetForm onAssetCreated={handleAssetCreated} />
            </View>
          )}

          <AssetList onRefresh={handleRefresh} refreshing={refreshing} focusQrTagId={focusQrTag} />
        </View>

        <Modal
          visible={showQRScanner}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowQRScanner(false)}
        >
          <QRScanner
            onQRCodeScanned={handleQRCodeScanned}
            onClose={() => setShowQRScanner(false)}
          />
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
