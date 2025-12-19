import { getRealm } from "@/storage/realm";
import { Asset } from "@/storage/models/assets/Asset";
import { AssetType } from "@/types/asset";

export interface QRScanResult {
  success: boolean;
  asset?: Asset;
  message: string;
}

export class QRService {
  /**
   * Scan a QR code and find the associated asset
   */
  static async scanQRCode(qrTagId: string): Promise<QRScanResult> {
    try {
      const realm = await getRealm();

      const asset = realm.objects(Asset).filtered("qrTagId == $0", qrTagId)[0] as Asset | undefined;

      if (!asset) {
        return {
          success: false,
          message: `No asset found with QR tag: ${qrTagId}`,
        };
      }

      return {
        success: true,
        asset,
        message: `Found asset: ${asset.name}`,
      };
    } catch (error) {
      console.error("Error scanning QR code:", error);
      return {
        success: false,
        message: "Error scanning QR code. Please try again.",
      };
    }
  }

  /**
   * Generate a new QR tag ID for an asset based on type
   */
  static generateAssetQRTagId(type: AssetType): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    const prefix = type.toUpperCase().substring(0, 3);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Validate QR tag ID format
   */
  static isValidQRTagId(qrTagId: string): boolean {
    return /^[A-Z]{3}-[A-Z0-9]+-[A-Z0-9]+$/.test(qrTagId);
  }

  /**
   * Check if QR tag ID is already in use
   */
  static async isQRTagIdInUse(qrTagId: string): Promise<boolean> {
    try {
      const realm = await getRealm();
      const asset = realm.objects(Asset).filtered("qrTagId == $0", qrTagId)[0];
      return !!asset;
    } catch (error) {
      console.error("Error checking QR tag ID:", error);
      return false;
    }
  }
}
