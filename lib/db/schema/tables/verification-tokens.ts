import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";

// Auth.js Drizzle adapter table. Holds short-lived magic-link tokens. The
// adapter writes a row when a magic-link email is sent and deletes it when the
// token is consumed. Composite PK on (identifier, token).
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({
      name: "verification_tokens_identifier_token_pk",
      columns: [table.identifier, table.token],
    }),
  }),
);

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
