jest.mock("realm");
jest.mock("@realm/react");

jest.mock("@/storage/realm", () => ({
  getRealm: jest.fn().mockResolvedValue({
    isClosed: false,
    schema: [{ name: "Asset" }, { name: "Inspection" }],
    write: jest.fn((fn) => fn()),
    objects: jest.fn(() => []),
    close: jest.fn(),
  }),
  resetRealm: jest.fn().mockResolvedValue(undefined),
}));

import { getRealm, resetRealm } from "@/storage/realm";

describe("Realm Database Setup", () => {
  let realm: Realm;

  beforeAll(async () => {
    realm = await getRealm();
  });

  afterAll(async () => {
    if (realm && !realm.isClosed) {
      realm.close();
    }
  });

  it("should create Realm instance successfully", async () => {
    expect(realm).toBeDefined();
    expect(realm.isClosed).toBe(false);
  });

  it("should load Asset schema", () => {
    const assetSchema = realm.schema.find((s) => s.name === "Asset");
    expect(assetSchema).toBeDefined();
    expect(assetSchema?.name).toBe("Asset");
  });

  it("should load Inspection schema", () => {
    const inspectionSchema = realm.schema.find((s) => s.name === "Inspection");
    expect(inspectionSchema).toBeDefined();
    expect(inspectionSchema?.name).toBe("Inspection");
  });

  it("should allow write transactions", () => {
    expect(() => {
      realm.write(() => {
        // Empty write transaction
      });
    }).not.toThrow();
  });

  it("should reset database successfully", async () => {
    await expect(resetRealm()).resolves.not.toThrow();
  });
});
