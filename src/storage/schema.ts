import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "assets",
      columns: [
        { name: "type", type: "string" },
        { name: "name", type: "string" },
        { name: "location", type: "string", isOptional: true },
        { name: "condition", type: "string" },
        { name: "notes", type: "string", isOptional: true },
        { name: "qr_tag_id", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "synced", type: "boolean" },
      ],
    }),
    tableSchema({
      name: "inspections",
      columns: [
        { name: "asset_id", type: "string", isIndexed: true },
        { name: "inspector", type: "string" },
        { name: "description", type: "string" },
        { name: "score", type: "number" },
        { name: "timestamp", type: "number" },
        { name: "maintenance_needed", type: "boolean" },
        { name: "next_due", type: "number", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "synced", type: "boolean" },
      ],
    }),
  ],
});
