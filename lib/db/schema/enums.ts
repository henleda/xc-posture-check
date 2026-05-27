import { pgEnum } from "drizzle-orm/pg-core";

// Assessment lifecycle. Six phases the orchestrator can be in plus three
// terminal states. See spec > DATA MODEL > assessments and CLAUDE.md > Working
// with Inngest.
export const assessmentStatus = pgEnum("assessment_status", [
  "queued",
  "discovering",
  "analyzing",
  "probing",
  "complete",
  "partial",
  "failed",
]);

// Per-asset probe categories. Each value corresponds to one probe file under
// /lib/probes/. See CLAUDE.md > Probe development rules.
export const probeType = pgEnum("probe_type", [
  "tls",
  "waf",
  "api",
  "bot",
  "latency",
  "bigip",
  "cloudnative",
]);

// Inventory-level findings (one per assessment, computed across all assets).
export const inventoryFindingType = pgEnum("inventory_finding_type", [
  "cloud_distribution",
  "fragmentation_matrix",
  "coverage_matrix",
  "f5_footprint",
]);

// Telemetry / audit events. Spec > USER FLOWS > Flow three (seller telemetry).
export const eventType = pgEnum("event_type", [
  "link_clicked",
  "scan_started",
  "scan_completed",
  "pdf_downloaded",
  "meeting_booked",
  "scan_failed",
  "asset_drilldown",
]);

// asn_to_provider_map categorization. Determines which buckets a provider
// shows up in across the report (cloud chart vs CDN/edge chart vs ISP filter).
export const providerCategory = pgEnum("provider_category", [
  "cloud",
  "cdn",
  "edge",
  "hosting",
  "isp",
]);
