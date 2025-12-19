import { AssetCondition, AssetType, RoadSurfaceType, TrafficVolume } from "@/types";
import { Road } from "@/storage/models/assets/Road";
import { Inspection } from "@/storage/models/Inspection";
import Realm from "realm";

export const createMockRoad = (overrides: Partial<Road> = {}): Road => {
  const mockRoad = {
    _id: new Realm.BSON.ObjectId(),
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
    get type() {
      return AssetType.ROAD;
    },
    get isRoadAsset() {
      return true;
    },
    get roadDimensions() {
      if (this.length && this.width) {
        return `${this.length}m × ${this.width}m`;
      }
      return "Dimensions not specified";
    },
    generateQRTagId() {
      return "ROA-123";
    },

    // Mock inspections relationship
    inspections: [],

    ...overrides,
  } as Road;

  return mockRoad;
};

export const createMockRoadList = (count: number = 3): Road[] => {
  return Array.from({ length: count }, (_, index) => {
    return createMockRoad({
      name: `Road ${index + 1}`,
      location: `Location ${index + 1}`,
    });
  });
};

export const createMockInspection = (overrides: Partial<Inspection> = {}): Inspection & { update: jest.Mock; destroyPermanently: jest.Mock } => {
  const mockInspection = {
    _id: new Realm.BSON.ObjectId(),
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
    photos: [],

    // Mock methods used in tests
    update: jest.fn((fn?: () => void) => {
      if (fn) fn();
    }),
    destroyPermanently: jest.fn(),

    ...overrides,
  } as unknown as Inspection & { update: jest.Mock; destroyPermanently: jest.Mock };

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
