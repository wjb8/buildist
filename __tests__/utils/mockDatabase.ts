import { AssetType, AssetCondition } from "@/types/models";

// Mock data factories
export const createMockAsset = (overrides: Partial<any> = {}) => ({
  id: "asset-1",
  type: AssetType.EQUIPMENT,
  name: "Test Asset",
  location: "Main Office",
  condition: AssetCondition.GOOD,
  notes: "Test notes",
  qrTagId: "QR-123",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  synced: false,
  inspections: [],
  isMaintenanceOverdue: false,
  lastInspectionDate: null,
  get conditionScore() {
    const scores = {
      [AssetCondition.EXCELLENT]: 5,
      [AssetCondition.GOOD]: 4,
      [AssetCondition.FAIR]: 3,
      [AssetCondition.POOR]: 2,
      [AssetCondition.CRITICAL]: 1,
    };
    return scores[this.condition] || 0;
  },
  markAsNeedsMaintenance: jest.fn(),
  updateCondition: jest.fn(),
  generateQRTagId: jest.fn(() => Promise.resolve("QR-123")),
  update: jest.fn(),
  ...overrides,
});

export const createMockInspection = (overrides: Partial<any> = {}) => ({
  id: "inspection-1",
  assetId: "asset-1",
  inspector: "John Doe",
  description: "Test inspection",
  score: 8,
  timestamp: new Date("2024-01-01"),
  maintenanceNeeded: false,
  nextDue: new Date("2024-02-01"),
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  synced: false,
  asset: createMockAsset(),
  isOverdue: false,
  get scoreCategory() {
    if (this.score >= 9) return "excellent";
    if (this.score >= 7) return "good";
    if (this.score >= 5) return "fair";
    if (this.score >= 3) return "poor";
    return "critical";
  },
  daysUntilDue: 30,
  scheduleNextInspection: jest.fn(),
  updateScore: jest.fn(),
  markMaintenanceComplete: jest.fn(),
  update: jest.fn(),
  ...overrides,
});

// Mock database collections
export const createMockCollection = (items: any[] = []) => ({
  query: jest.fn(() => ({
    fetch: jest.fn(() => Promise.resolve(items)),
    observe: jest.fn(() => ({
      subscribe: jest.fn(),
    })),
    count: jest.fn(() => Promise.resolve(items.length)),
  })),
  create: jest.fn((callback) => {
    const mockRecord = {};
    callback(mockRecord);
    return Promise.resolve(mockRecord);
  }),
  find: jest.fn((id) => Promise.resolve(items.find((item) => item.id === id))),
});

// Mock database instance
export const createMockDatabase = (assets: any[] = [], inspections: any[] = []) => ({
  collections: {
    get: jest.fn((tableName) => {
      switch (tableName) {
        case "assets":
          return createMockCollection(assets);
        case "inspections":
          return createMockCollection(inspections);
        default:
          return createMockCollection();
      }
    }),
  },
  write: jest.fn((callback) => callback()),
  read: jest.fn((callback) => callback()),
  unsafeResetDatabase: jest.fn(),
});

// Helper to create multiple mock assets
export const createMockAssetList = (count: number = 3) => {
  return Array.from({ length: count }, (_, index) =>
    createMockAsset({
      id: `asset-${index + 1}`,
      name: `Asset ${index + 1}`,
      type: Object.values(AssetType)[index % Object.values(AssetType).length],
      condition: Object.values(AssetCondition)[index % Object.values(AssetCondition).length],
    })
  );
};

// Helper to create multiple mock inspections
export const createMockInspectionList = (count: number = 3, assetId: string = "asset-1") => {
  return Array.from({ length: count }, (_, index) =>
    createMockInspection({
      id: `inspection-${index + 1}`,
      assetId,
      inspector: `Inspector ${index + 1}`,
      score: Math.floor(Math.random() * 10) + 1,
      timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000), // Each day earlier
    })
  );
};
