import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

// Domains we will not assess: F5 customers, F5 competitors, regulated targets.
// Checked at the orchestrator boundary before any probe fires.
export const domainExclusions = pgTable("domain_exclusions", {
  id: uuid("id").primaryKey().notNull(),
  domain: text("domain").notNull().unique(),
  reason: text("reason"),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DomainExclusion = typeof domainExclusions.$inferSelect;
export type NewDomainExclusion = typeof domainExclusions.$inferInsert;
