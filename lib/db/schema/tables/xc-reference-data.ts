import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

// Cached read-only XC API reference data. Key is a stable identifier such as
// "pop_locations", "signature_counts", "threat_campaigns". Refreshed on a
// 24-hour cadence per CLAUDE.md > XC API integration rules; falls back to
// vendored snapshots under /data/ when the API is unreachable.
export const xcReferenceData = pgTable("xc_reference_data", {
  key: text("key").primaryKey().notNull(),
  value: jsonb("value").$type<unknown>().notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});

export type XcReferenceData = typeof xcReferenceData.$inferSelect;
export type NewXcReferenceData = typeof xcReferenceData.$inferInsert;
