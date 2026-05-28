import { pgTable, text, integer, uuid, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import type { AdapterAccountType } from "next-auth/adapters";

// Auth.js Drizzle adapter table. Composite PK on (provider, providerAccountId)
// per the adapter contract. We use the adapter's expected camelCase column
// names (not snake_case) because the adapter references them by literal name.
// Magic-link auth doesn't actually use this table much — sessions + verification
// tokens carry the flow — but the adapter requires it to exist.
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    compoundKey: primaryKey({
      name: "accounts_provider_account_id_pk",
      columns: [table.provider, table.providerAccountId],
    }),
  }),
);

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
