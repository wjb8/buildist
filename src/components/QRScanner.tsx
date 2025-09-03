import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { View as StyledView } from "./View";
import { Text as StyledText } from "./Text";
import { Button as StyledButton } from "./Button";
import { layoutStyles } from "@/styles";
import { colors } from "@/styles";

interface QRScannerProps {
  onQRCodeScanned: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onQRCodeScanned, onClose }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);
    console.log("QR Code scanned:", { type, data });

    // Validate QR code format (should be our asset QR tag format)
    if (data.startsWith("ROA-")) {
      onQRCodeScanned(data);
    } else {
      Alert.alert(
        "Invalid QR Code",
        "This QR code is not a valid asset tag. Please scan a road asset QR code.",
        [
          {
            text: "Try Again",
            onPress: () => setScanned(false),
          },
          {
            text: "Cancel",
            onPress: onClose,
          },
        ]
      );
    }
  };

  if (!permission) {
    return (
      <StyledView center style={styles.container}>
        <StyledText variant="body">Requesting camera permission...</StyledText>
      </StyledView>
    );
  }

  if (!permission.granted) {
    return (
      <StyledView center style={styles.container}>
        <StyledText variant="h3" center style={[layoutStyles.mb3]}>
          Camera Permission Required
        </StyledText>
        <StyledText variant="body" center style={[layoutStyles.mb3]}>
          We need camera access to scan QR codes for asset identification.
        </StyledText>
        <StyledButton variant="primary" onPress={requestPermission}>
          Grant Camera Permission
        </StyledButton>
        <StyledButton variant="secondary" onPress={onClose} style={[layoutStyles.mt2]}>
          Cancel
        </StyledButton>
      </StyledView>
    );
  }

  return (
    <StyledView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay} />
        </View>

        <View style={styles.instructions}>
          <StyledText variant="h3" center color="white" style={[layoutStyles.mb2]}>
            Scan QR Code
          </StyledText>
          <StyledText variant="body" center color="white" style={[layoutStyles.mb3]}>
            Position the QR code within the frame to scan
          </StyledText>
          {scanned && (
            <StyledText variant="bodySmall" center color="white" style={[layoutStyles.mb3]}>
              QR code detected! Processing...
            </StyledText>
          )}
        </View>

        <View style={styles.controls}>
          <StyledButton variant="secondary" onPress={onClose}>
            Cancel
          </StyledButton>
          {scanned && (
            <StyledButton
              variant="primary"
              onPress={() => setScanned(false)}
              style={[layoutStyles.ml2]}
            >
              Scan Again
            </StyledButton>
          )}
        </View>
      </CameraView>
    </StyledView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  middleRow: {
    flexDirection: "row",
    height: 250,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanArea: {
    width: 250,
    height: 250,
    position: "relative",
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: colors.primary.main,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  controls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
