import { AssetCondition, RoadSurfaceType, TrafficVolume } from "@/types";
import { Road } from "@/storage/models/assets/Road";
import { Inspection } from "@/storage/models/Inspection";

export const createMockRoad = (overrides: Partial<Road> = {}): Road => {
  const mockRoad = {
    id: "road-1",
    name: "Main Street",
    location: "Downtown",
    condition: AssetCondition.GOOD,
    notes: "Primary arterial road",
    qrTagId: "ROA-123",
    surfaceType: RoadSurfaceType.ASPHALT,
    trafficVolume: TrafficVolume.HIGH,
    length: 1000,
    width: 12,
    lanes: 4,
    speedLimit: 50,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    synced: true,

    // Mock methods
    update: jest.fn(),
    destroyPermanently: jest.fn(),

    // Mock computed properties
    get isRoadAsset() {
      return true;
    },
    get roadDimensions() {
      return "1000m × 12m";
    },
    get trafficLevel() {
      return "High traffic (arterial)";
    },
    get conditionScore() {
      return 4;
    },
    get maintenancePriority() {
      return "LOW - Standard maintenance";
    },
    get estimatedMaintenanceCost() {
      return 2000;
    },
    get nextInspectionDue() {
      return new Date("2025-01-01");
    },

    validateRoadData() {
      return {
        isValid: true,
        errors: [],
      };
    },

    // Mock business logic methods
    markAsNeedsMaintenance: jest.fn(),
    updateCondition: jest.fn(),
    generateQRTagId() {
      return "ROA-123";
    },

    // Mock inspections relationship
    inspections: [],

    ...overrides,
  } as unknown as Road;

  return mockRoad;
};

export const createMockRoadList = (count: number = 3): Road[] => {
  return Array.from({ length: count }, (_, index) => {
    return createMockRoad({
      id: `road-${index + 1}`,
      name: `Road ${index + 1}`,
      location: `Location ${index + 1}`,
    });
  });
};

export const createMockInspection = (overrides: Partial<Inspection> = {}): Inspection => {
  const mockInspection = {
    id: "inspection-1",
    assetId: "road-1",
    inspector: "John Doe",
    description: "Annual road condition assessment",
    score: 8,
    timestamp: new Date("2024-01-01"),
    maintenanceNeeded: false,
    nextDue: new Date("2025-01-01"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    synced: true,

    update: jest.fn(),
    destroyPermanently: jest.fn(),

    ...overrides,
  } as unknown as Inspection;

  return mockInspection;
};

export const createMockDatabase = () => ({
  write: jest.fn((callback) => callback()),
  collections: {
    roads: {
      create: jest.fn(),
      find: jest.fn(),
      query: jest.fn(() => ({
        observe: jest.fn(() => []),
      })),
    },
    inspections: {
      create: jest.fn(),
      find: jest.fn(),
      query: jest.fn(() => ({
        observe: jest.fn(() => []),
      })),
    },
  },
});
