import { pgTable, uuid, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { inventoryFindingType } from "../enums";
import { assessments } from "./assessments";
import type { InventoryFindingData } from "../../zod/inventory-findings";

// One row per (assessment, finding_type). Four finding types per spec:
// cloud_distribution, fragmentation_matrix, coverage_matrix, f5_footprint.
// data shape varies per finding_type — see lib/db/zod/inventory-findings.ts.
export const inventoryFindings = pgTable(
  "inventory_findings",
  {
    id: uuid("id").primaryKey().notNull(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    findingType: inventoryFindingType("finding_type").notNull(),
    data: jsonb("data").$type<InventoryFindingData>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    assessmentIdx: index("inventory_findings_assessment_id_idx").on(table.assessmentId),
  }),
);

export type InventoryFinding = typeof inventoryFindings.$inferSelect;
export type NewInventoryFinding = typeof inventoryFindings.$inferInsert;
