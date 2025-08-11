import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";
import { Road, Inspection } from "./models";

// First, create a migration
const migrations = [
  // We'll add migrations here when we increment the version
];

const adapter = new SQLiteAdapter({
  schema,
  // (You might want to comment it out for development, see Migrations guide for more details)
  // migrations,
  dbName: "buildistDB",
  // Optional database name. If not provided, 'watermelondb' will be used
  onSetUpError: (error) => {
    // Database failed to load -- offer the user to reload the app or log out
    console.error("Database setup error:", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Road, Inspection],
});

export const collections = {
  roads: database.collections.get<Road>("roads"),
  inspections: database.collections.get<Inspection>("inspections"),
};

export const resetDatabase = async () => {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
  console.log("Database reset complete");
};

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

export default database;
