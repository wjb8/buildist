import { getRealm } from "@/storage/realm";
import { Road } from "@/storage/models/assets/Road";
import { Vehicle } from "@/storage/models/assets/Vehicle";

export interface QRScanResult {
  success: boolean;
  asset?: Road | Vehicle;
  message: string;
}

export class QRService {
  /**
   * Scan a QR code and find the associated asset
   */
  static async scanQRCode(qrTagId: string): Promise<QRScanResult> {
    try {
      const realm = await getRealm();

      // Find asset by QR tag ID across known asset types
      let asset: Road | Vehicle | undefined = realm
        .objects(Road)
        .filtered("qrTagId == $0", qrTagId)[0] as Road | undefined;

      if (!asset) {
        asset = realm.objects(Vehicle).filtered("qrTagId == $0", qrTagId)[0] as Vehicle | undefined;
      }

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
   * Generate a new QR tag ID for an asset
   */
  static generateQRTagId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `ROA-${timestamp}-${random}`.toUpperCase();
  }

  static generateVehicleQRTagId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `VEH-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Validate QR tag ID format
   */
  static isValidQRTagId(qrTagId: string): boolean {
    return /^(ROA|VEH)-[A-Z0-9]+-[A-Z0-9]+$/.test(qrTagId);
  }

  /**
   * Check if QR tag ID is already in use
   */
  static async isQRTagIdInUse(qrTagId: string): Promise<boolean> {
    try {
      const realm = await getRealm();
      const road = realm.objects(Road).filtered("qrTagId == $0", qrTagId)[0];
      const vehicle = realm.objects(Vehicle).filtered("qrTagId == $0", qrTagId)[0];
      return !!(road || vehicle);
    } catch (error) {
      console.error("Error checking QR tag ID:", error);
      return false;
    }
  }
}
