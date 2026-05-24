XC POSTURE CHECK
Full build specification, v2.0 (Hybrid and Multi-Cloud Edition)
Author: Dan Henley, F5 XC PMM
Status: Ready for build

ONE-LINE DEFINITION

A 90-second public-facing security posture assessment for any company that maps their external app inventory across every cloud and edge provider they use, scores the fragmentation across that inventory, and surfaces protection gaps per asset. Branded by F5 Distributed Cloud, attributed to the field seller who shared the link.

THE NARRATIVE SHIFT FROM v1

The v1 spec assessed one domain across five checks. v2 assesses the entire external footprint of a company across three layers of story: where their apps live, how fragmented their security stack is, and which assets are exposed. This shift is the entire point. Competitors show prospects a PoP map. F5 XC shows prospects their own infrastructure and proves the multi-cloud reality they live in every day. The probe is the proof.

PRIMARY GOALS

Goal one. Operationalize the architectural-DNA competitive frame. Cloudflare runs at edge only, Akamai runs at CDN only, Palo Alto runs at firewall only. F5 XC is the only security plane built from day one for apps distributed across clouds, edges, and data centers. The report renders that distinction in a buyer's own data.

Goal two. Make XC easier to sell. Compress discovery from weeks to minutes. Replace 8-hour AE-built TCO models with a 5-second consistent output. Pre-qualify prospects before the first call.

Goal three. Make Dan visible to the F5 field. Every report carries the seller's name and contact info. Every share is a marketing distribution event. The footer credits XC PMM. Within 90 days, the field associates Dan and his team with a tool they use weekly.

WHAT THIS IS NOT

Not an active exploitation tool. All probes are benign, read-only, and within the bounds any security researcher operates daily.
Not a substitute for XC Web App Scanning. The tool runs passive external assessment. Web App Scanning is the deeper paid product the report points prospects toward.
Not a product owned by engineering. This is a field enablement and brand asset built by PMM, hosted outside the XC SKU surface, with editorial control retained by the PMM team.

USER FLOWS

Flow one. Seller creates a share link.
Seller signs in with an @f5.com magic link. Opens a short form, enters prospect company name, optionally pre-fills the apex domain, clicks Generate. The system returns a personalized share URL of the form xcposture.io/r/d-henley-acme. Seller copies the link into outreach.

Flow two. Prospect runs the assessment.
Prospect clicks the link and lands on a cobranded page showing the F5 mark, the prospect company name, and the seller's photo and contact. One input field for the apex domain, one button. The assessment takes 60 to 120 seconds with a real-time progress UI showing each phase completing: discovering assets, mapping infrastructure, probing each property, computing fragmentation, generating findings. The report renders inline. The prospect downloads a PDF, shares with colleagues, or books time with the seller via embedded calendar.

Flow three. Seller sees telemetry.
Seller dashboard shows who clicked, who completed an assessment, who downloaded the PDF, who booked a meeting, and which findings drove engagement. Email notifications fire to the seller on each meaningful event. Daily and weekly digests available.

THE REPORT STRUCTURE

Three layers, in order.

Layer A. Your infrastructure. Where your apps live.
The cloud and edge distribution of the prospect's assets. Pie chart of cloud providers. Heat map of geographic concentration. Total count of external properties. Single sentence: "Acme runs 47 external properties across AWS (23), Azure (11), Cloudflare (7), and unmapped infrastructure (6)." The XC narrative beat: most security platforms run in one place. XC runs anywhere your apps already live.

Layer B. Your fragmentation. How many distinct security postures you operate.
The Policy Fragmentation Index, a single number from 0 to 100. Below 30 means a consistent stack. Above 60 means significant fragmentation. Most mid-market and enterprise prospects score above 60 and have never seen this number about themselves. Supporting matrix shows distinct WAF vendors, distinct CDN providers, distinct cert issuers, distinct TLS configurations across the asset base. The XC narrative beat: most security platforms add another console. XC replaces N consoles with one policy plane.

Layer C. Your gaps. Which assets are exposed.
The per-asset detail. Each discovered property gets a posture grade computed from the original five checks plus the new infrastructure-exposure probes. Sortable table. Color-coded by grade. Quick filters: shadow IT (assets not behind any WAF), high-value (assets matching login or payment patterns), legacy (BIG-IP fingerprints detected), cloud-native exposed (Kubernetes or admin UI exposure). The XC narrative beat: XC extends protection to apps in any environment without code changes or migration.

THE PROBES

Probe set one runs at the inventory level, building the asset base before per-asset checks fire.

Inventory probe one. Asset discovery and enumeration.

Method. Take the apex domain. Pull all observed subdomains from Certificate Transparency logs via crt.sh. Cross-reference against passive DNS data sources (SecurityTrails free tier or DNSDumpster) for additional subdomains. Resolve each to one or more IPs. For each IP, perform reverse DNS lookup. Cap inventory at 500 assets per assessment to keep scan time bounded. Rank by recency of cert issuance and retain the top 500.

Output. A canonical asset list per assessment with: subdomain, resolved IPs, ASN, hosting provider, geographic region, first-observed timestamp.

Implementation. crt.sh returns JSON for queries of the form https://crt.sh/?q=%25.acme.com&output=json. Use the ip-api.com or ipinfo.io free tier for IP-to-ASN-to-org mapping. Cache lookups in Postgres for 24 hours.

Inventory probe two. Cloud and edge provider classification.

Method. Map each asset's ASN and CNAME chain to a provider classification. Maintain a vendored mapping table of ASNs to providers: AWS (multiple ASNs), Azure (AS8075), GCP (AS15169), Oracle Cloud, IBM Cloud, Cloudflare (AS13335), Akamai (AS16625 plus others), Fastly (AS54113), Imperva (AS19551), and 20-plus more. Inspect CNAME chains for telltale records (elb.amazonaws.com, azurefd.net, akadns.net, cloudflare.com, fastly.net). Detect F5 BIG-IP devices in the path via response header signatures (Server: BIG-IP, X-WA-Info, F5-specific cookie patterns).

Output. Per-asset cloud/edge classification with confidence score. Provider distribution chart at the inventory level.

XC tie-in. The cloud distribution chart is the single most important visual in the report. Use it to frame the entire conversation. Caption: "Your apps already run in N clouds. F5 XC is the only security plane built for that reality."

Inventory probe three. Policy Fragmentation Index.

Method. Across the asset inventory, count distinct WAF vendors detected, distinct CDN providers in front of properties, distinct cert issuers signing certs, distinct TLS configuration profiles (group by negotiated cipher plus protocol set), distinct security header policy sets (normalize CSP, HSTS, frame options into a hash, count distinct hashes). Compute a normalized score from 0 to 100 weighted across these dimensions. 0 means one consistent stack everywhere, 100 means every asset is different.

Output. The Fragmentation Index number, plus a five-row matrix showing each dimension and the count of distinct values.

XC tie-in. The Fragmentation Index becomes the prospect's first quantitative view of their operational debt. Caption: "Every distinct vendor in this matrix is a console, a renewal cycle, a runbook, and a hiring requirement. XC replaces these with one."

Implementation note. The fragmentation math should be defensible. Document the exact formula in the report appendix so a skeptical CISO can audit it. Suggested formula: weighted geometric mean of (distinct_count / total_assets) across each dimension, scaled to 0-100, with weights WAF 30, CDN 25, cert 15, TLS 15, headers 15.

Probe set two runs per asset, against each of the top 50 highest-value assets in the inventory. Value ranking applies a heuristic: apex domain weight 10, www subdomain weight 9, subdomains matching login/auth/api/admin/dashboard/portal/checkout weight 8, all others weight 5. Probe set two runs against the top 50 by weight.

Per-asset probe one. TLS and certificate posture.

Method. Open a TLS connection on port 443. Inspect cert chain (issuer, signature algorithm, key length, SAN coverage, time to expiry). Inspect protocol support across TLS 1.0 through 1.3. Inventory cipher suites, flag weak suites and any lacking forward secrecy. Probe headers for HSTS (presence, max-age, includeSubDomains, preload). Probe for OCSP stapling.

Score. Letter grade A through F. Cert validity 20 percent, protocol versions 25 percent, cipher hygiene 25 percent, HSTS 20 percent, OCSP 10 percent.

XC tie-in. XC Application Delivery handles cert lifecycle automatically, keeps TLS posture current across all environments without per-cloud configuration, supports mTLS for service-to-service.

Implementation. Node's tls module for primary checks. Optional testssl.sh invocation for deep cipher inventory on a sampling basis (the top 10 assets only, to keep latency reasonable).

Per-asset probe two. WAF presence and security headers.

Method. Send a small benign probe set. One probe with an innocuous SQL-flavored query parameter pattern. One probe with a known-scanner User-Agent. One probe with a path traversal pattern using a non-existent file. Inspect response status, headers, and body for fingerprints of common WAFs (Cloudflare, AWS WAF, Akamai, Imperva, F5 BIG-IP ASM/Advanced WAF, F5 XC WAAP, Sucuri, ModSecurity, plus 20 more from the wafw00f signature database). Fetch the homepage and parse all response headers for CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, and COEP.

Score. WAF detection 50 percent, header completeness 50 percent.

XC tie-in. XC WAAP applies one policy across edge, cloud, and on-prem. Surface the count of XC signature categories (read from XC reference data) for credibility.

Per-asset probe three. API surface and exposure.

Method. For each asset, probe a curated list of API paths: /api, /api/v1, /api/v2, /api/v3, /graphql, /swagger.json, /openapi.json, /swagger-ui, /api-docs, /actuator, /actuator/health, /.well-known/openapi.json, /v1/api-docs, /metrics, /debug, /health, /status, plus 15 more. For each path returning 200, record URL, content type, response size, and a 500-byte content sample. If content type is JSON, run regex matches for PII patterns (email, phone, SSN format, JWT three-segment pattern, AWS access key ID pattern, credit card with Luhn check).

Score. Public unauthenticated API endpoint count 50 percent (weighted negatively), PII pattern hits 50 percent (weighted negatively).

XC tie-in. XC API Discovery does this continuously across all assets and clouds with no per-asset configuration. Plus schema validation, drift detection, sensitive-data flagging, and runtime API protection.

Per-asset probe four. Bot exposure and automation defense.

Method. Fetch the homepage with a standard browser User-Agent and inspect for JS challenge presence (Cloudflare Turnstile, hCaptcha, reCAPTCHA, F5 Bot Defense, Akamai Bot Manager, DataDome, PerimeterX signatures). Fetch with a known bot User-Agent and compare. A meaningful difference signals active bot logic. Scan DOM for login, signup, checkout forms. Send exactly two unauthenticated POST requests to any detected form endpoint with 10 seconds between them. Record whether rate limiting triggered.

Score. Bot-defense product detected 40 percent, behavioral UA difference 30 percent, rate limit signal 30 percent.

XC tie-in. F5 Distributed Cloud Bot Defense (Shape technology) uses ML trained on the largest bot-traffic dataset in the industry, runs across all asset environments, sub-100ms decisions, track record at top US banks, airlines, and retailers.

Per-asset probe five. Edge performance baseline.

Method. Run TTFB probes from 15 geographic origin points. Geos: us-east-1, us-east-2, us-west-1, us-west-2, ca-central-1, eu-west-1, eu-central-1, eu-north-1, ap-southeast-1, ap-northeast-1, ap-south-1, ap-southeast-2, sa-east-1, me-south-1, af-south-1. Each probe measures DNS, TCP, TLS, TTFB, total transfer. Three probes per geo, take median. Render a global heat map.

Score. Computed against an XC reference baseline. Pull the XC PoP list (vendored static JSON of 30-plus PoP locations). For each prober geo, compute great-circle distance to the nearest XC PoP and estimate one-way latency. Render side-by-side: current median TTFB per geo vs estimated XC TTFB per geo. Improvement percentage drives the grade.

XC tie-in. XC global anycast network, integrated security and delivery in one hop, no separate CDN purchase, consistent performance across all regions without per-region engineering.

Implementation. Deploy lightweight Next.js Edge Functions to 15 Vercel regions. The function accepts a target URL and returns timing data. Orchestrator invokes all 15 in parallel per asset, but only for the top 10 assets by weight (otherwise scan time blows up). Cap geo probes at 150 per assessment.

Probe set three is the hybrid and multi-cloud value-prop instrumentation. These run against the inventory or a curated subset.

Hybrid probe one. BIG-IP and F5 footprint fingerprinting.

Method. Across the inventory, probe for response signatures indicating BIG-IP devices in the request path. Look for the Server: BIG-IP header (still common in default configs), F5-specific cookie patterns (BIGipServer prefix, TS prefix), specific 404 page signatures, default port behaviors on 8443. Probe for NGINX and NGINX Plus signatures (Server header, X-Accel headers). Detect F5 BIG-IP Next signatures as they emerge.

Output. Asset count with detected F5 footprint. Inventory of detected F5 products in path. If the prospect runs BIG-IP on-prem (often true and often unknown to PMM and security teams), the entire OEBM and BIG-IP Bridge narrative activates for this report.

XC tie-in. "You already have F5 protecting your data center. XC extends the same policy plane to your cloud apps with one ruleset, no rearchitecture." This is OEBM operationalized. Make this section visually distinctive in the report when the F5 footprint is non-zero.

Hybrid probe two. Cloud-native infrastructure exposure.

Method. Across the inventory, probe for exposed cloud-native infrastructure. Specifically: Kubernetes API server (port 6443, /healthz endpoint, /version endpoint, /api/v1/namespaces with auth challenge), exposed Kubernetes dashboards (specific HTML signatures), exposed admin UIs (Jenkins on /login.html with X-Jenkins header, ArgoCD on /api/v1/session with specific response, Grafana on /login with specific signature, RabbitMQ management on 15672, Elasticsearch on 9200, Kibana on 5601), exposed cloud metadata endpoints (probe for 169.254.169.254 reachability via response headers from front-end), exposed database ports as TCP probes (5432 Postgres, 3306 MySQL, 27017 MongoDB, 6379 Redis).

Output. Asset count with cloud-native infrastructure exposed. Categorized list.

XC tie-in. XC Multi-Cloud Networking (App Connect and Distributed Apps) addresses this layer. Cloudflare and Akamai do not. Position XC as the only edge security platform with native understanding of cloud-native infrastructure.

Note on Dan's technical positioning. This probe section reads as written by someone who knows Kubernetes and cloud-native infrastructure deeply. Dan's Isovalent and Cilium background gives unique credibility here. The copy should reflect that depth. Avoid corporate fluff. Use the technical terms platform engineering teams use daily.

Hybrid probe three. Coverage gap matrix.

Method. Using the inventory plus the per-asset check results, compute a coverage matrix. Columns: WAF coverage, Bot defense coverage, API protection coverage, DDoS protection coverage (inferred from edge provider). Rows: each asset, grouped by cloud provider. For each cell, render protected, unprotected, or unknown.

Output. The coverage matrix is the single most actionable artifact in the report. AEs use it directly in their next prospect conversation. Most prospects discover they have 10 to 30 percent of their inventory with no WAF, no Bot defense, or no API protection. These are shadow IT, marketing microsites, M&A-acquired properties, and dev/staging environments that escaped governance.

XC tie-in. "XC's Run Anywhere model addresses these gaps without rearchitecture. Deploy XC in front of any of these assets with no code changes. Same policy plane, same console, same SLA."

ARCHITECTURE

Stack.
Next.js 14 (App Router) on Vercel for app and edge functions.
Postgres on Neon for relational data.
ClickHouse Cloud or Neon for the asset inventory and timing data (high cardinality, low cost on ClickHouse). Recommend ClickHouse if engineering bench supports it, Postgres-only otherwise.
Inngest for background job orchestration.
S3 for PDF and scan artifacts.
NextAuth with email magic link via Resend.
Resend for transactional email.
PostHog for product analytics.
Sentry for error monitoring.
Upstash Redis for rate limiting and probe-result caching.

Why this stack. Matches Dan's Democracy.Watch tech. Low ops surface. Vercel handles the global edge prober fleet natively. Total monthly cost at moderate volume (500 scans per month) sits under $500 across all services.

System flow in prose.

The Next.js app handles all UI and API routes. A scan request creates an assessment record in Postgres and enqueues an Inngest workflow. The workflow runs in five phases.

Phase one. Inventory discovery. Pull subdomains from crt.sh and passive DNS. Resolve all to IPs. Lookup ASNs. Classify cloud providers. Persist to Postgres asset table. Write progress update.

Phase two. Inventory-level analysis. Compute provider distribution. Compute Fragmentation Index. Persist results. Write progress update.

Phase three. Per-asset probes. For each of the top 50 assets by weight, fan out into parallel probe workers (TLS, WAF, API, Bot). Concurrency limit of 10 assets in flight at once. Each probe respects the per-target rate limit. Persist findings per asset. Write progress updates as percentage complete.

Phase four. Latency probes. Invoke 15-region edge prober fleet for the top 10 assets. Compute XC comparison. Persist.

Phase five. Hybrid probes. Run BIG-IP fingerprinting and cloud-native exposure probes across the inventory. Compute coverage matrix. Persist.

Phase six. Finalize. Compute overall posture grade. Generate findings copy. Mark assessment complete.

Real-time UI updates. Server-Sent Events from a Next.js route handler polling Postgres every 500ms for assessment status and progress percentage. The UI shows each phase by name as it completes.

Edge prober fleet. 15 lightweight Next.js Edge Functions deployed to 15 Vercel regions. Orchestrator invokes in parallel. Each prober returns timing data for the requested URL.

Scan time budget. Hard cap of 180 seconds per assessment. Above that, the assessment marks partial-complete and returns what it has. Hard request budget of 2000 HTTP requests per assessment (up from 250 in v1, justified by the inventory fan-out).

XC API INTEGRATION

Auth.
F5 XC uses an API token in the Authorization header with value `APIToken <token>`, or a P12 client certificate. Base URL: https://<tenant>.console.ves.volterra.io. For this tool, work with Yogesh to provision an internal service tenant with read-only scope on reference data only. No customer-tenant access from this app, ever.

What the tool calls XC for.

One. PoP location reference. Fetched on boot, cached for 7 days. Static JSON fallback vendored in the repo.

Two. Signature and policy reference counts. Pull WAF signature counts, signature categories, bot signal dimensions, API definition counts. Cache for 24 hours. Surface these in the XC tie-in copy with phrases like "XC WAAP currently maintains X attack signatures across Y categories."

Three. Threat campaign feed reference. If available via API, surface the count of active threat campaigns XC tracks. This is a strong proof point for the security narrative.

Four. Web App Scanning reference data. Pull aggregate counts of API definitions, exposed assets, and CVE detections across the XC customer base if such an aggregate endpoint exists. Otherwise hardcode approved marketing figures.

What the tool does not call XC for.

Anything touching XC customer tenant data. Anything requiring the prospect to have an XC account. Active scanning of the prospect domain through XC infrastructure in v1 or v2.

Future Tier-3 integration design.

The data model includes a verified flag on the assessments table. If a prospect agrees to a deeper scan and drops the required DNS TXT record, the system unlocks an XC Web App Scanning Recon scan via the F5 XC Web App Scanning API. The Web App Scanning API auth uses `Authorization: Heyhack <api_key>`. Recon endpoint accepts an apex domain and returns the full attack surface map enriched with CVE data. The v2 build reserves this flag and UI placeholder for a future Tier 3 build.

DATA MODEL

Tables in Postgres. Full migration written in Claude Code.

users
  id uuid pk
  email text unique, must end in @f5.com
  name text
  title text
  avatar_url text
  calendar_url text
  slack_handle text
  created_at timestamp

share_links
  id uuid pk
  slug text unique
  user_id uuid fk users
  prospect_company text
  prospect_apex_domain text nullable
  verified boolean default false
  notes text
  created_at timestamp
  expires_at timestamp nullable

assessments
  id uuid pk
  share_link_id uuid fk share_links nullable
  apex_domain text
  status enum queued, discovering, analyzing, probing, complete, partial, failed
  phase text
  progress_percent int
  overall_grade text
  fragmentation_index int
  total_assets_discovered int
  total_assets_probed int
  started_at timestamp
  completed_at timestamp
  visitor_ip_hash text
  visitor_country text

assets
  id uuid pk
  assessment_id uuid fk assessments
  hostname text
  resolved_ips jsonb
  asn text
  asn_org text
  cloud_provider text
  cloud_region text
  cdn_provider text nullable
  weight int
  first_observed timestamp nullable
  was_probed boolean default false

asset_findings
  id uuid pk
  asset_id uuid fk assets
  probe_type enum tls, waf, api, bot, latency, bigip, cloudnative
  score int nullable
  grade text nullable
  raw_data jsonb
  findings jsonb
  duration_ms int

inventory_findings
  id uuid pk
  assessment_id uuid fk assessments
  finding_type enum cloud_distribution, fragmentation_matrix, coverage_matrix, f5_footprint
  data jsonb

events
  id uuid pk
  assessment_id uuid fk assessments nullable
  share_link_id uuid fk share_links nullable
  event_type enum link_clicked, scan_started, scan_completed, pdf_downloaded, meeting_booked, scan_failed, asset_drilldown
  metadata jsonb
  created_at timestamp

domain_exclusions
  id uuid pk
  domain text unique
  reason text
  added_at timestamp

asn_to_provider_map
  asn text pk
  provider text
  category enum cloud, cdn, edge, hosting, isp
  updated_at timestamp

xc_reference_data
  key text pk
  value jsonb
  fetched_at timestamp

SCORING AND GRADES

Per-asset grade. Weighted average of probe scores. TLS 15, WAF 25, API 25, Bot 20, Latency 15. Grade mapping: A 90+, B 80-89, C 70-79, D 60-69, F below 60.

Overall posture grade. Computed across the inventory. 40 percent from the average per-asset grade weighted by asset weight, 30 percent from the Fragmentation Index (inverted, so lower fragmentation scores higher), 30 percent from the Coverage Matrix completeness (percentage of assets with WAF, Bot, API protection).

Fragmentation Index. Geometric mean of normalized distinct-value ratios across WAF (weight 30), CDN (25), cert issuer (15), TLS profile (15), security header policy (15). Scaled to 0-100.

REPORT FORMAT

Page one. The hook.
Big number: overall posture grade. Big number: Fragmentation Index. Big number: total assets discovered. Big number: percentage of assets without full protection. Below the numbers, the three-layer narrative as section headers.

Page two. Your infrastructure.
Pie chart of cloud and edge provider distribution. World map of asset geographic concentration. Asset count by cloud provider table. F5 footprint detection callout if non-zero. XC narrative panel: "Why XC was built for this reality."

Page three. Your fragmentation.
Fragmentation Index gauge. Five-row matrix of distinct vendors and policies across the inventory. Cost-of-fragmentation narrative: console count, vendor renewal cycles, hiring requirements. XC narrative panel: "One policy plane, every environment."

Page four. Your gaps.
Coverage matrix table, assets as rows grouped by cloud provider, protection categories as columns. Shadow IT callout (count of assets with no WAF). High-value asset callout (count of login or payment assets with gaps). Cloud-native exposure callout. XC narrative panel: "Run Anywhere security model."

Pages five plus. Per-asset details, top 20 assets.
Card per asset with grade, findings, evidence, screenshots where applicable, technical detail disclosures for engineers.

Footer on every page. Cobrand: F5 mark, "Sent by Dan Henley, VP Product Marketing, F5 Distributed Cloud," seller photo, contact info, calendar embed. Small print: "Generated by F5 XC Posture Check. Built by F5 XC Product Marketing. All probes are passive and read-only. Methodology and formulas published at xcposture.io/methodology."

PDF version uses identical content with print-optimized layout, one finding per page for top-priority issues.

SELLER ATTRIBUTION AND TELEMETRY

Every share link encodes the seller. Report header and footer both show seller name, photo, calendar link. PDF includes seller signature block. Calendar embed uses the seller's calendar URL.

Telemetry events captured per share link: link_clicked, scan_started, scan_completed, pdf_downloaded, asset_drilldown (which asset card was expanded), meeting_booked. Each event triggers an email to the seller via Resend. Daily and weekly digest options for high-volume sellers.

Seller dashboard. Lists all share links with prospect company, apex domain, last activity, scan count, PDF downloads, meetings booked, overall grade. Sortable, filterable. A leaderboard view shows top sellers across the field by scans completed and meetings booked.

AUTH AND ACCESS CONTROL

Seller auth. NextAuth with email magic link via Resend, restricted to @f5.com. Sessions in JWT, 30-day expiry.

Prospect access. No auth required to view a share link or run an assessment.

Anonymous assessments. Root domain (xcposture.io with no /r/ slug) allows anonymous scans for credibility and SEO. No seller attribution. Tighter rate limits.

Rate limits.
Anonymous root: 1 assessment per IP per day.
Share link visit: 3 assessments per IP per day.
Same apex re-scan: 1 per 4-hour window (cache hit returns prior result).
Per-target probe rate: 10 requests per second hard cap.

Visitor IP hashing. SHA-256 hash of IP plus daily-rotating salt. No raw IP storage.

ANTI-ABUSE AND ETHICAL GUARDRAILS

No active exploitation, ever. Every probe is benign.
Total request budget per assessment: 2000 HTTP requests maximum.
Per-target rate limit: max 10 requests per second.
User-Agent: "F5XCPostureCheck/2.0 (contact: postmaster@xcposture.io)"
Honor robots.txt for any non-probe content fetches.
Exclusion list. Pre-seeded with .gov, .mil, .edu TLDs plus a manual list of known sensitive F5 customers and competitors. Sellers add via dashboard. Domain owners email an opt-out address and get added within 24 hours.
Audit log. Every assessment logged with timestamp, target, requesting seller, source IP hash. Retained for 90 days.
Methodology transparency. Publish the full probe list, request count, and scoring formulas at xcposture.io/methodology. This is both an ethical posture and a credibility move with CISOs.

BUILD SEQUENCE

The build runs 6 weeks with 2 engineers plus Dan. Adjust pace if more headcount becomes available.

Week one. Foundation and inventory.
Scaffold Next.js on Vercel. Set up Neon Postgres, Inngest, Resend, Upstash Redis, Sentry, PostHog. Configure NextAuth with @f5.com restriction. Build the seller login flow and share link creation. Implement inventory probe one (asset discovery via crt.sh and passive DNS) and inventory probe two (cloud and edge classification via ASN mapping). Vendor the ASN-to-provider map. Vendor the XC PoP location JSON.

Exit criteria. A seller logs in, creates a share link, opens it, runs an assessment, and sees a full inventory list with cloud provider classification.

Week two. Inventory analysis and first per-asset probes.
Implement inventory probe three (Policy Fragmentation Index). Implement per-asset probes one (TLS) and two (WAF and security headers). Set up the SSE progress stream. Build the phase-by-phase progress UI. Wire up the basic three-layer report shell.

Exit criteria. Assessments produce the cloud distribution chart, Fragmentation Index, and per-asset TLS and WAF findings for the top 50 assets.

Week three. Remaining per-asset probes plus latency fleet.
Implement per-asset probes three (API surface) and four (Bot defense). Deploy the 15-region edge prober fleet to Vercel. Implement per-asset probe five (Latency) with the XC comparison math. Build asset weight ranking and the top-50 selection.

Exit criteria. Assessments produce all five per-asset probes plus the latency map.

Week four. Hybrid and multi-cloud probes plus the coverage matrix.
Implement hybrid probe one (BIG-IP and F5 fingerprinting). Implement hybrid probe two (cloud-native infrastructure exposure). Implement hybrid probe three (coverage matrix computation). Build the coverage matrix table UI with grouping by cloud provider. Build the F5 footprint callout. Build the shadow IT and high-value asset filters.

Exit criteria. Assessments produce the full three-layer report including coverage matrix and hybrid probe findings.

Week five. Report polish, PDF, attribution, alpha launch.
Design and build the final report UI with grade badges, narrative panels, technical disclosures. Apply F5 brand tokens. PDF generation via Playwright with single-column print layout. Seller dashboard with telemetry. Calendar embed. Email notifications. Daily digest option. Internal alpha with 10 sellers, balanced by geo and segment. Personal 30-minute onboarding per rep with Dan.

Exit criteria. Alpha live with 10 sellers using on real prospects.

Week six. Hardening, telemetry depth, internal launch.
Iterate on alpha feedback. Anti-abuse hardening. Rate limit tuning. Build the seller leaderboard view. Publish the methodology page. Internal launch email co-signed by Dan and John Dumalac. 90-second Loom from Dan walking through a real prospect example. Demo at the next XC field call. Buffer for post-launch issues.

Exit criteria. Tool launched internally. Telemetry flowing. Daily field usage measurable.

NAMING AND BRANDING

Working name options.
XC Posture Check. Descriptive, clean, signals function.
FrontDoor. Plays on F5's "front door of the app" positioning.
SurfaceMap. Emphasizes the discovery and mapping angle.
StackMirror. Captures the reflection-of-your-reality positioning.

Recommendation. XC Posture Check, with the report itself branded as "Your Application Security Posture, by F5 XC." The clinical naming pairs well with the data-rich, narrative-light report style that lands best with CISOs.

Domain. xcposture.io. Personally registered for v2. Cost negligible.

Visual identity. F5 brand tokens. F5 mark in header. "Built by F5 XC Product Marketing, led by Dan Henley" in footer. The tool feels like an F5 thing, not a third-party.

OPEN QUESTIONS

One. XC API tenant. Provision an internal service tenant via Yogesh for read-only reference data. Action item for week zero.

Two. Calendar integration. What do F5 sellers use, Outlook, HubSpot Meetings, Chili Piper, Calendly? Determines embed format.

Three. ASN-to-provider mapping. Vendor a starter map. Plan a quarterly refresh from authoritative sources (IPinfo, Hurricane Electric BGP toolkit).

Four. ClickHouse vs Postgres-only. If the engineering bench supports ClickHouse, use it for the asset and timing data. If not, run Postgres-only with appropriate partitioning. Decide week zero.

Five. Brand approval. Logo usage, color palette, footer copy. One meeting with the brand team. Dan can approve directly per stated authority.

Six. Field communication plan. Co-signed launch email from Dan and John Dumalac. 90-second Loom walking through a real prospect example. Demo at the next XC field call.

Seven. Roadmap intent. Field tool indefinitely or eventual product? Affects multi-tenancy architecture. Recommend designing the data model for product viability now (clean tenancy boundaries on the users table) so the option stays open without rework.

Eight. KPH adjacency. Worth a conversation about whether XC Posture Check and Kubernetes Policy Hub converge into a single Posture brand over 12 to 18 months. The technical depth in cloud-native probes positions this naturally.

Nine. Internal alpha cohort. 10 reps picked by John, balanced across geos and segments. Each one gets a personal 30-minute onboarding with Dan. This is the moment Dan's name lands in the field.

Ten. Public launch vs internal-only. v2 is internal-only by default. After 90 days of field signal and confirmed pipeline impact, evaluate opening the tool to the public web for inbound lead generation. Anonymous root scans with seller attribution stripped become a lead-gen funnel feeding XC marketing automation.

WHAT GOOD LOOKS LIKE AT 90 DAYS

100-plus sellers actively using the tool. 500-plus assessments per week. 30-plus sourced meetings traceable to the tool. 5-plus named opportunities with the tool cited in close-won notes. A queue of feature requests from the field driving v3. A dataset of 5000-plus assessed prospects becoming the analytical basis for the first F5 State of External App Security report, co-published by Dan and the XC PMM team, which is its own visibility engine.

WHAT GOOD LOOKS LIKE AT 12 MONTHS

The tool sits at the center of XC field motion. Every AE uses it on every new opp. The dataset becomes a strategic asset for XC product, sales targeting, and marketing. Dan's name attaches to a tool every field rep touches weekly. The narrative shift the tool produces (cloud distribution, fragmentation index, coverage matrix) becomes the standard XC discovery frame, embedded in pitch decks, battlecards, and executive briefings. The State of External App Security report becomes an annual flagship publication for the XC business.

END OF SPEC
