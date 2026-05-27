CREATE TYPE "public"."assessment_status" AS ENUM('queued', 'discovering', 'analyzing', 'probing', 'complete', 'partial', 'failed');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('link_clicked', 'scan_started', 'scan_completed', 'pdf_downloaded', 'meeting_booked', 'scan_failed', 'asset_drilldown');--> statement-breakpoint
CREATE TYPE "public"."inventory_finding_type" AS ENUM('cloud_distribution', 'fragmentation_matrix', 'coverage_matrix', 'f5_footprint');--> statement-breakpoint
CREATE TYPE "public"."probe_type" AS ENUM('tls', 'waf', 'api', 'bot', 'latency', 'bigip', 'cloudnative');--> statement-breakpoint
CREATE TYPE "public"."provider_category" AS ENUM('cloud', 'cdn', 'edge', 'hosting', 'isp');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"title" text,
	"avatar_url" text,
	"calendar_url" text,
	"slack_handle" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_email_f5_only" CHECK ("users"."email" ~* '^[^@]+@f5\.com$')
);
--> statement-breakpoint
CREATE TABLE "share_links" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"user_id" uuid NOT NULL,
	"prospect_company" text NOT NULL,
	"prospect_apex_domain" text,
	"verified" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "share_links_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"share_link_id" uuid,
	"apex_domain" text NOT NULL,
	"status" "assessment_status" DEFAULT 'queued' NOT NULL,
	"phase" text,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"overall_grade" text,
	"fragmentation_index" integer,
	"total_assets_discovered" integer,
	"total_assets_probed" integer,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"visitor_ip_hash" text,
	"visitor_country" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"assessment_id" uuid NOT NULL,
	"hostname" text NOT NULL,
	"resolved_ips" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"asn" text,
	"asn_org" text,
	"cloud_provider" text,
	"cloud_region" text,
	"cdn_provider" text,
	"weight" integer DEFAULT 0 NOT NULL,
	"first_observed" timestamp with time zone,
	"was_probed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_findings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"asset_id" uuid NOT NULL,
	"probe_type" "probe_type" NOT NULL,
	"score" integer,
	"grade" text,
	"raw_data" jsonb,
	"findings" jsonb,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_findings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"assessment_id" uuid NOT NULL,
	"finding_type" "inventory_finding_type" NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"assessment_id" uuid,
	"share_link_id" uuid,
	"event_type" "event_type" NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_exclusions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"domain" text NOT NULL,
	"reason" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "domain_exclusions_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "asn_to_provider_map" (
	"asn" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"category" "provider_category" NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xc_reference_data" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_share_link_id_share_links_id_fk" FOREIGN KEY ("share_link_id") REFERENCES "public"."share_links"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_findings" ADD CONSTRAINT "asset_findings_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_findings" ADD CONSTRAINT "inventory_findings_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_share_link_id_share_links_id_fk" FOREIGN KEY ("share_link_id") REFERENCES "public"."share_links"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "share_links_user_id_idx" ON "share_links" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "assessments_share_link_id_idx" ON "assessments" USING btree ("share_link_id");--> statement-breakpoint
CREATE INDEX "assessments_apex_domain_idx" ON "assessments" USING btree ("apex_domain");--> statement-breakpoint
CREATE INDEX "assessments_status_idx" ON "assessments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "assets_assessment_id_idx" ON "assets" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "assets_hostname_idx" ON "assets" USING btree ("hostname");--> statement-breakpoint
CREATE INDEX "asset_findings_asset_id_idx" ON "asset_findings" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "asset_findings_probe_type_idx" ON "asset_findings" USING btree ("probe_type");--> statement-breakpoint
CREATE INDEX "inventory_findings_assessment_id_idx" ON "inventory_findings" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "events_assessment_id_idx" ON "events" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "events_share_link_id_idx" ON "events" USING btree ("share_link_id");--> statement-breakpoint
CREATE INDEX "events_event_type_idx" ON "events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");