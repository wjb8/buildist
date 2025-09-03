import { StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { View as StyledView } from "./View";
import { Text as StyledText } from "./Text";
import { layoutStyles } from "@/styles";
import { colors } from "@/styles";

interface QRCodeDisplayProps {
  qrTagId: string;
  assetName?: string;
  size?: number;
}

export default function QRCodeDisplay({ qrTagId, assetName, size = 200 }: QRCodeDisplayProps) {
  return (
    <StyledView center style={styles.container}>
      {assetName && (
        <StyledText variant="h3" center style={layoutStyles.mb2}>
          {assetName}
        </StyledText>
      )}

      <StyledView center card style={[styles.qrContainer, { width: size + 40, height: size + 40 }]}>
        <QRCode
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
