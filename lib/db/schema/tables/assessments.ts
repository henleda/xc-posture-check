import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { assessmentStatus } from "../enums";
import { shareLinks } from "./share-links";

// One row per assessment run. `share_link_id` is nullable because anonymous
// assessments (no co-branding) are permitted. `phase` is a free-text label
// for the current orchestrator step; `status` is the authoritative state.
export const assessments = pgTable(
  "assessments",
  {
    id: uuid("id").primaryKey().notNull(),
    shareLinkId: uuid("share_link_id").references(() => shareLinks.id, {
      onDelete: "set null",
    }),
    apexDomain: text("apex_domain").notNull(),
    status: assessmentStatus("status").notNull().default("queued"),
    phase: text("phase"),
    progressPercent: integer("progress_percent").notNull().default(0),
    overallGrade: text("overall_grade"),
    fragmentationIndex: integer("fragmentation_index"),
    totalAssetsDiscovered: integer("total_assets_discovered"),
    totalAssetsProbed: integer("total_assets_probed"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    visitorIpHash: text("visitor_ip_hash"),
    visitorCountry: text("visitor_country"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    shareLinkIdx: index("assessments_share_link_id_idx").on(table.shareLinkId),
    apexDomainIdx: index("assessments_apex_domain_idx").on(table.apexDomain),
    statusIdx: index("assessments_status_idx").on(table.status),
  }),
);

export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
