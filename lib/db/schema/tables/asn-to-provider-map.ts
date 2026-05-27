import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { providerCategory } from "../enums";

// Vendored ASN → cloud/edge/CDN/hosting/ISP mapping. Refreshed quarterly per
// spec; loaded from /data/asn-to-provider.json on first boot. ASN is the PK
// (e.g. "AS13335"), unique by definition.
export const asnToProviderMap = pgTable("asn_to_provider_map", {
  asn: text("asn").primaryKey().notNull(),
  provider: text("provider").notNull(),
  category: providerCategory("category").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AsnToProvider = typeof asnToProviderMap.$inferSelect;
export type NewAsnToProvider = typeof asnToProviderMap.$inferInsert;
