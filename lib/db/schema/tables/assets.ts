import { pgTable, uuid, text, boolean, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { assessments } from "./assessments";

// One row per discovered asset for an assessment. `resolved_ips` is jsonb to
// support multi-A records and SAN-style multi-IP resolution. `weight` is the
// importance score derived during ranking (top-500 cut, asset-grade weighting).
export const assets = pgTable(
  "assets",
  {
    id: uuid("id").primaryKey().notNull(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    hostname: text("hostname").notNull(),
    resolvedIps: jsonb("resolved_ips").$type<string[]>().notNull().default([]),
    asn: text("asn"),
    asnOrg: text("asn_org"),
    cloudProvider: text("cloud_provider"),
    cloudRegion: text("cloud_region"),
    cdnProvider: text("cdn_provider"),
    weight: integer("weight").notNull().default(0),
    firstObserved: timestamp("first_observed", { withTimezone: true }),
    wasProbed: boolean("was_probed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    assessmentIdx: index("assets_assessment_id_idx").on(table.assessmentId),
    hostnameIdx: index("assets_hostname_idx").on(table.hostname),
  }),
);

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
