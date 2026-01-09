import { AssetCondition, AssetType } from "@/types/asset";
import { Asset } from "@/storage/models/assets/Asset";
import { Inspection } from "@/storage/models/Inspection";
import Realm from "realm";

export const createMockAsset = (overrides: Partial<Asset> = {}): Asset => {
  const mockAsset = {
    _id: new Realm.BSON.ObjectId(),
    type: AssetType.ROAD,
    name: "Main Street",
    location: "Downtown",
    condition: AssetCondition.GOOD,
    notes: "Primary arterial road",
    qrTagId: "ROA-123",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    synced: true,

    // Mock methods
    update: jest.fn(),
    destroyPermanently: jest.fn(),

    // Mock computed properties
    get assetType() {
      return this.type as AssetType;
    },
    generateQRTagId() {
      return "ROA-123";
    },

    ...overrides,
  } as Asset;

  return mockAsset;
};

export const createMockAssetList = (count: number = 3): Asset[] => {
  return Array.from({ length: count }, (_, index) => {
    return createMockAsset({
      name: `Asset ${index + 1}`,
      location: `Location ${index + 1}`,
    });
  });
};

export const createMockRoad = createMockAsset;
export const createMockRoadList = createMockAssetList;

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
