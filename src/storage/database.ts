import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";
import { Asset, Inspection } from "./models";

const adapter = new SQLiteAdapter({
  schema,
  // Optional: Enable WAL mode for better performance with concurrent reads/writes
  // This requires Expo custom development build
  jsi: true, // Enable JSI for better performance (requires custom build)
  onSetUpError: (error) => {
    console.error("Database setup error:", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Asset, Inspection],
});

export const initializeDatabase = async (): Promise<Database> => {
  try {
    // The database will be automatically initialized when first accessed
    // add any setup logic here if needed
    console.log("Database initialized successfully");
    return database;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
};

// useful for development/testing!
export const resetDatabase = async (): Promise<void> => {
  try {
    await database.write(async () => {
      await database.unsafeResetDatabase();
    });
    console.log("Database reset successfully");
  } catch (error) {
    console.error("Failed to reset database:", error);
    throw error;
  }
};

export const collections = {
  assets: database.collections.get<Asset>("assets"),
  inspections: database.collections.get<Inspection>("inspections"),
};

export default database;
