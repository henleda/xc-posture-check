import { pgTable, uuid, text, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { probeType } from "../enums";
import { assets } from "./assets";
import type { AssetFindingRaw, AssetFindingResult } from "../../zod/asset-findings";

// One row per (asset, probe_type) combination. raw_data preserves what the
// probe actually saw on the wire (status code, response headers, body
// fingerprint matches); findings is the normalized output the report renders.
// Both jsonb shapes vary per probe_type — Zod discriminated unions in
// lib/db/zod/asset-findings.ts pin them down.
export const assetFindings = pgTable(
  "asset_findings",
  {
    id: uuid("id").primaryKey().notNull(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    probeType: probeType("probe_type").notNull(),
    score: integer("score"),
    grade: text("grade"),
    rawData: jsonb("raw_data").$type<AssetFindingRaw>(),
    findings: jsonb("findings").$type<AssetFindingResult>(),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    assetIdx: index("asset_findings_asset_id_idx").on(table.assetId),
    probeTypeIdx: index("asset_findings_probe_type_idx").on(table.probeType),
  }),
);

export type AssetFinding = typeof assetFindings.$inferSelect;
export type NewAssetFinding = typeof assetFindings.$inferInsert;
