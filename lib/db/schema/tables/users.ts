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
