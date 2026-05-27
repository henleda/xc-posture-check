// Drizzle schema entry point. Re-exports every table and enum.
//
// New tables land under ./tables/<name>.ts and are added here as a barrel
// re-export. drizzle.config.ts points at this file as the schema source.

export * from "./enums";

export * from "./tables/users";
export * from "./tables/share-links";
export * from "./tables/assessments";
export * from "./tables/assets";
export * from "./tables/asset-findings";
export * from "./tables/inventory-findings";
export * from "./tables/events";
export * from "./tables/domain-exclusions";
export * from "./tables/asn-to-provider-map";
export * from "./tables/xc-reference-data";
