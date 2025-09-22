import { Alert, Platform, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useCallback, useRef, useState } from "react";
import { View as StyledView } from "./View";
import { Text as StyledText } from "./Text";
import { Button as StyledButton } from "./Button";
import { layoutStyles } from "@/styles";
import { colors } from "@/styles";
interface QRCodeDisplayProps {
  qrTagId: string;
  assetName?: string;
  size?: number;
}

export default function QRCodeDisplay({ qrTagId, assetName, size = 200 }: QRCodeDisplayProps) {
  const [saving, setSaving] = useState(false);
  const svgRef = useRef<any>(null);

  const handleSave = useCallback(async () => {
    try {
      if (saving) return;
      setSaving(true);

      if (Platform.OS === "web") {
        setSaving(false);
        Alert.alert("Not Supported", "Saving to photos is not supported on web.");
        return;
      }

      const MediaLibrary: any = await import("expo-media-library");
      const FileSystem: any = await import("expo-file-system");

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        setSaving(false);
        Alert.alert("Permission Required", "Please allow photo library access to save QR codes.");
        return;
      }

      const pngBase64: string = await new Promise((resolve) => {
        svgRef.current?.toDataURL((data: string) => resolve(data));
      });

      const fileName = `qr_${qrTagId.replace(/[^a-zA-Z0-9-_]/g, "_")}.png`;
      const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
      if (!baseDir) {
        setSaving(false);
        Alert.alert("Save Unavailable", "Storage directory is not available on this platform.");
        return;
      }
      const fileUri = `${baseDir}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, pngBase64, { encoding: "base64" });

      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert("Saved", "QR code saved.");
    } catch (error) {
      Alert.alert("Save Failed", "Could not save the QR code. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [qrTagId, saving]);

  return (
    <StyledView center style={styles.container}>
      {assetName && (
        <StyledText variant="h3" center style={layoutStyles.mb2}>
          {assetName}
        </StyledText>
      )}

      <StyledView center card style={[styles.qrContainer, { width: size + 40, height: size + 40 }]}>
        <QRCode
          getRef={(c) => (svgRef.current = c)}
          value={qrTagId}
          size={size}
          color={colors.text.primary}
          backgroundColor={colors.background.primary}
          logoSize={0}
          logoMargin={0}
          logoBorderRadius={0}
          quietZone={10}
        />
      </StyledView>

      <StyledText variant="bodySmall" center color="neutral" style={layoutStyles.mt2}>
        QR Tag: {qrTagId}
      </StyledText>

      <StyledButton
        variant="primary"
        onPress={handleSave}
        disabled={saving}
        style={[layoutStyles.mt2]}
      >
        {saving ? "Saving..." : "Save QR to Photos"}
      </StyledButton>
    </StyledView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
});
