export interface InspectionData {
  id: string;
  assetId: string;
  inspector: string;
  description: string;
  score: number;
  timestamp: Date;
  maintenanceNeeded: boolean;
  nextDue?: Date;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
}

export interface CreateInspectionData {
  assetId: string;
  inspector: string;
  description: string;
  score?: number;
  maintenanceNeeded?: boolean;
  nextDue?: Date;
}

export interface UpdateInspectionData {
  inspector?: string;
  description?: string;
  score?: number;
  maintenanceNeeded?: boolean;
  nextDue?: Date;
}
