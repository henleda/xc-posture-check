import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

// Per-seller co-branded share URL. Slug shape: <seller-initials>-<company>,
// e.g. "d-henley-acme". Prospect-facing route is /r/[slug].
export const shareLinks = pgTable(
  "share_links",
  {
    id: uuid("id").primaryKey().notNull(),
    slug: text("slug").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    prospectCompany: text("prospect_company").notNull(),
    prospectApexDomain: text("prospect_apex_domain"),
    verified: boolean("verified").notNull().default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("share_links_user_id_idx").on(table.userId),
  }),
);

export type ShareLink = typeof shareLinks.$inferSelect;
export type NewShareLink = typeof shareLinks.$inferInsert;
