import { useState, useEffect, useMemo } from "react";
import { Alert, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { View } from "./View";
import { Text } from "./Text";
import { Button } from "./Button";
import AssetForm from "./AssetForm";
import AssetList from "./AssetList";
import QRScanner from "./QRScanner";
import AIAssistant from "./AIAssistant";
import { colors, spacing, layoutStyles, textStyles, buttonStyles } from "@/styles";
import { QRService } from "@/services/QRService";
import { seedDemoData } from "@/utils/demoData";
import * as Application from "expo-application";
import Constants from "expo-constants";

interface MainPageProps {
  onLogout: () => void;
}

function getBuildLabel(): string | null {
  const configVersion =
    Constants.expoConfig?.version ||
    // fallback for older manifests
    (Constants.manifest as any)?.version ||
    "";
  const version = configVersion || Application.nativeApplicationVersion || "";
  const build = Application.nativeBuildVersion || "";
  if (version && build) return `v${version} (${build})`;
  if (version) return `v${version}`;
  return null;
}

export default function MainPage({ onLogout }: MainPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const buildLabel = useMemo(() => getBuildLabel(), []);

  // Seed demo data when component mounts
  useEffect(() => {
    seedDemoData();
  }, []);

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

  const handleAssistantApplied = (result: { success: boolean; message: string }) => {
    if (result.success) {
      handleRefresh();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={spacing.xl}
      style={[layoutStyles.flex]}
    >
      {showForm ? (
        <View style={[layoutStyles.flex]}>
          <View style={[layoutStyles.flex, layoutStyles.p4]}>
            <View style={[layoutStyles.mb2]}>
              <View
                style={[
                  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
                  layoutStyles.mb2,
                ]}
              >
                <View row style={{ alignItems: "baseline" }}>
                  <Text variant="h2">Buildist</Text>
                  {buildLabel ? (
                    <Text variant="caption" color="neutral" style={{ marginLeft: spacing.sm }}>
                      {buildLabel}
                    </Text>
                  ) : null}
                </View>
                <Button
                  variant="primary"
                  onPress={onLogout}
                  style={{ paddingHorizontal: spacing.sm }}
                >
                  Logout
                </Button>
              </View>

              <View style={[layoutStyles.flexRow, layoutStyles.rowSpaceBetween, layoutStyles.mb4]}>
                <Button
                  variant={showForm ? "secondary" : "primary"}
                  onPress={() => setShowForm(!showForm)}
                  size="small"
                  style={[layoutStyles.flex, layoutStyles.mr2]}
                >
                  {showForm ? "Hide Form" : "Add Asset"}
                </Button>

                <Button
                  variant="primary"
                  onPress={() => setShowQRScanner(true)}
                  size="small"
                  style={[layoutStyles.flex, layoutStyles.ml2]}
                >
                  Scan QR Code
                </Button>

                <Button
                  variant="secondary"
                  onPress={() => setShowAIAssistant(true)}
                  size="small"
                  style={[layoutStyles.flex, layoutStyles.ml2]}
                >
                  AI Assistant
                </Button>
              </View>
            </View>

            <View style={[layoutStyles.flex]}>
              <AssetForm onAssetCreated={handleAssetCreated} />
            </View>
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
        </View>
      ) : (
        <View style={[layoutStyles.flex]}>
          <View style={[layoutStyles.p4, layoutStyles.pb0]}>
            <View style={[layoutStyles.mb4]}>
              <View
                style={[
                  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
                  layoutStyles.mb2,
                ]}
              >
                <View row style={{ alignItems: "baseline" }}>
                  <Text variant="h2">Buildist</Text>
                  {buildLabel ? (
                    <Text variant="caption" color="neutral" style={{ marginLeft: spacing.sm }}>
                      {buildLabel}
                    </Text>
                  ) : null}
                </View>
                <Button
                  variant="primary"
                  onPress={onLogout}
                  style={{ paddingHorizontal: spacing.sm }}
                >
                  Logout
                </Button>
              </View>

              <View style={[layoutStyles.flexRow, layoutStyles.rowSpaceBetween, layoutStyles.mb4]}>
                <Button
                  variant={showForm ? "secondary" : "primary"}
                  onPress={() => setShowForm(!showForm)}
                  size="small"
                  style={[layoutStyles.flex, layoutStyles.mr2]}
                >
                  {showForm ? "Hide Form" : "Add Asset"}
                </Button>

                <Button
                  variant="primary"
                  onPress={() => setShowQRScanner(true)}
                  size="small"
                  style={[layoutStyles.flex, layoutStyles.ml2]}
                >
                  Scan QR Code
                </Button>

                <Button
                  variant="secondary"
                  onPress={() => setShowAIAssistant(true)}
                  size="small"
                  style={[layoutStyles.flex, layoutStyles.ml2]}
                >
                  AI Assistant
                </Button>
              </View>
            </View>
          </View>

          <AssetList onRefresh={handleRefresh} refreshing={refreshing} focusQrTagId={focusQrTag} />

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
        </View>
      )}

      <Modal
        visible={showAIAssistant}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowAIAssistant(false)}
      >
        <AIAssistant
          onActionApplied={handleAssistantApplied}
          onClose={() => setShowAIAssistant(false)}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}
