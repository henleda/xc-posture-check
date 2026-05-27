import { pgTable, uuid, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { eventType } from "../enums";
import { assessments } from "./assessments";
import { shareLinks } from "./share-links";
import type { EventMetadata } from "../../zod/events";

// Telemetry + audit log. Append-only — no updated_at, no soft delete.
// Either assessment_id, share_link_id, or both can be present; some events
// (e.g., link_clicked) fire before any assessment exists.
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().notNull(),
    assessmentId: uuid("assessment_id").references(() => assessments.id, {
      onDelete: "set null",
    }),
    shareLinkId: uuid("share_link_id").references(() => shareLinks.id, {
      onDelete: "set null",
    }),
    eventType: eventType("event_type").notNull(),
    metadata: jsonb("metadata").$type<EventMetadata>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    assessmentIdx: index("events_assessment_id_idx").on(table.assessmentId),
    shareLinkIdx: index("events_share_link_id_idx").on(table.shareLinkId),
    eventTypeIdx: index("events_event_type_idx").on(table.eventType),
    createdAtIdx: index("events_created_at_idx").on(table.createdAt),
  }),
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
