import { pgTable, uuid, text, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Sellers. Spec calls them "users"; ADR-005 restricts emails to @f5.com in
// production. The CHECK constraint is a defensive belt to the application-layer
// suspenders in NextAuth's signIn callback.
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().notNull(),
    email: text("email").notNull().unique(),
    name: text("name"),
    title: text("title"),
    avatarUrl: text("avatar_url"),
    // image and emailVerified are required by Auth.js Drizzle adapter.
    // image overlaps with avatar_url; we keep both for now (image is the
    // adapter-managed value from OAuth providers we might add later, avatar_url
    // is seller-configurable). Phase 3 just reads image when present, else falls
    // back to avatar_url.
    image: text("image"),
    emailVerified: timestamp("email_verified", { withTimezone: true, mode: "date" }),
    calendarUrl: text("calendar_url"),
    slackHandle: text("slack_handle"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailDomainCheck: check("users_email_f5_only", sql`${table.email} ~* '^[^@]+@f5\\.com$'`),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
