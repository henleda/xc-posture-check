# XC Posture Check — Engineering Plan

Status: Draft v1 (2026-05-24)
Owner: Dan Henley
Builder cadence: Solo (Dan + Claude Code)
Target: full spec scope, no cuts. Solo timeline ≈ 8–10 weeks instead of the spec's 6.

This plan operationalizes `/docs/xc-posture-check-spec-v2.md` for a solo build. It is the source of truth for sequencing. Architectural decisions are recorded in `DECISIONS.md` as they are made. Running state lives in `PROGRESS.md` and is updated at the end of every session.

If this plan and the spec conflict, the spec wins. If this plan and `CLAUDE.md` conflict, `CLAUDE.md` wins (it encodes hard rules).

---

## 1. Decisions taken before this plan

These were locked in conversation and are baked into the plan. Each one will get a DECISIONS.md entry when DECISIONS.md is created.

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Domain is `f5evolution.com`, not the spec's `xcposture.io`. Product name remains "XC Posture Check". | Domain registered. Renaming the product is out of scope for v2; only URLs, User-Agent, and contact email change. |
| 2 | Solo build cadence; expect 8–10 weeks to spec completion. | One builder. Spec's 6-week assumption was for 2 engineers + Dan. |
| 3 | Postgres-only on Neon. No ClickHouse for v2. | Per CLAUDE.md. Spec open question 4 resolved: keep the operational surface small. Partition `assets` and `asset_findings` if cardinality demands later. |
| 4 | Single-tenant data model. No `tenant_id` column. | Per CLAUDE.md. Revisit only if the tool ever becomes a multi-prospect/multi-org SaaS. |
| 5 | NextAuth restriction to `@f5.com` in production. Local/preview honor `DEV_AUTH_ALLOWLIST` env var. | Dev access without an `@f5.com` mailbox always available. Prod stays clean. |
| 6 | XC API token in hand from day one. Live integration starts in week 1, with vendored static data as the fallback path always present. | Token available. Avoids a refactor later. |
| 7 | DNS managed by Vercel (move nameservers from current registrar). | Single pane for cert provisioning, edge config, and DNS. Cloudflare-only DNS not needed since we are not fronting with Cloudflare. |
| 8 | Plan committed as `/docs/engineering-plan.md`. PROGRESS.md updated at every session boundary. | Per CLAUDE.md session ritual. |

---

## 2. Pre-build dependencies (Dan's actions before week 0)

These block week-0 work. Each is small.

| Item | Owner | Blocking? | Notes |
|------|-------|-----------|-------|
| Move `f5evolution.com` nameservers to Vercel | Dan | Blocks custom domain on Vercel | Initiate in Vercel dashboard, Vercel issues NS records, update at registrar. DNS propagation can take up to 24h. |
| Provision Neon project + database | Dan (15 min) | Blocks Drizzle migrations | Use F5 email. Single project, two branches: `main` and `preview`. Capture `NEON_DATABASE_URL`. |
| Provision Vercel project env vars (we've already linked the repo) | Dan (10 min) | Blocks production builds | Just need to populate after services are signed up. |
| Provision Inngest account + app | Dan (10 min) | Blocks any Inngest workflow | Capture `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`. |
| Provision Upstash Redis | Dan (10 min) | Blocks rate limiting | Capture `UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN`. |
| Provision Resend account + verify `f5evolution.com` sending | Dan (15 min) | Blocks magic-link auth | DKIM/SPF setup in Vercel DNS after step 1. |
| Provision Sentry project (Next.js) | Dan (10 min) | Soft block; we should not start without error visibility | Capture `SENTRY_DSN`. |
| Provision PostHog project (Cloud) | Dan (5 min) | Soft block; week-1 telemetry needs it | Capture `POSTHOG_API_KEY`. |
| Provision AWS S3 bucket + IAM user with PutObject/GetObject only on that bucket | Dan (20 min) | Blocks PDF/artifact storage (week 7) | Defer until week 6, but useful to have set up early. |
| Provision ipinfo.io free-tier account | Dan (5 min) | Blocks inventory probe 1 (week 2) | Capture `IPINFO_TOKEN`. 50k req/month free tier. |
| Provide F5 brand assets (logo SVG, color tokens, typography) | Dan | Blocks polish (week 6) | If brand team gate exists, kick that meeting now (spec open question 5). |
| Confirm calendar embed format (Calendly / HubSpot / Chili Piper / Outlook) | Dan | Blocks seller dashboard (week 6) | Spec open question 2. |
| Provide initial domain-exclusion seed list | Dan | Blocks public launch readiness, not internal alpha | F5 customers + competitors. Comes from John Dumalac if needed. |

Items I cannot do for you are marked Dan-owned. Everything else in this plan I can execute.

---

## 3. Stack reaffirmation

Per `CLAUDE.md`. Exact versions are pinned in `package.json` once we scaffold; this section just states intent.

- **Runtime**: Node 20 LTS.
- **Framework**: Next.js 14 (App Router), React 18, TypeScript 5.3+ strict mode.
- **Styling**: Tailwind 3.4.
- **Package manager**: pnpm.
- **Database**: Postgres 16 on Neon. Drizzle ORM. Drizzle Kit for migrations.
- **Background jobs**: Inngest.
- **Cache + rate limit**: Upstash Redis.
- **Auth**: NextAuth (Auth.js) 5 with Resend magic link.
- **Email**: Resend.
- **PDF**: Playwright headless Chromium. Generation pattern TBD (see §8 risk register).
- **Analytics**: PostHog. **Errors**: Sentry.
- **Artifacts**: AWS S3.
- **Hosting**: Vercel (Next.js + 15-region Edge Functions for the prober fleet).
- **Testing**: Vitest (unit), Playwright (E2E on the critical seller/prospect flows only).

---

## 4. Environment, secrets, and the env matrix

Three environments: **local**, **preview** (Vercel previews), **production**.

```
                       local          preview              production
NEON_DATABASE_URL      branch=dev     branch=preview       branch=main
UPSTASH_REDIS_URL      shared dev DB  shared dev DB        prod DB
RESEND_API_KEY         sandbox        sandbox              live (f5evolution.com)
NEXTAUTH_URL           localhost      <preview>.vercel     https://f5evolution.com
NEXTAUTH_SECRET        local-only     vercel-managed       vercel-managed
INNGEST_EVENT_KEY      dev key        dev key              prod key
INNGEST_SIGNING_KEY    dev key        dev key              prod key
SENTRY_DSN             optional       prod project         prod project
POSTHOG_API_KEY        dev project    prod project         prod project
AWS_*                  local-only IAM same as prod         prod IAM
XC_API_TOKEN           same           same                 same
IPINFO_TOKEN           same           same                 same
DEV_AUTH_ALLOWLIST     dhenley@…      <preview tester>     UNSET
```

**Rules.**
1. Nothing committed to the repo. `.env.example` committed with dummy values, `.env.local` gitignored (already covered by ruflo's initial gitignore).
2. Vercel preview branches reuse Resend sandbox so prospects/customers never accidentally receive preview-env email.
3. `DEV_AUTH_ALLOWLIST` is a comma-separated list of email addresses that bypass the `@f5.com` restriction. **Production never reads this var** (NextAuth code asserts `process.env.NODE_ENV !== 'production'` before honoring it).
4. Rotation: any leak triggers immediate Resend/XC/Neon key rotation per CLAUDE.md rule. Document in DECISIONS.md.

---

## 5. Repository layout and housekeeping

The directory layout in CLAUDE.md is the target. Tasks I will do before week 0 work begins:

1. **Rename spec file**: `/docs/xc-posture-check-spec-v2.md` → `/docs/spec.md` to match CLAUDE.md's path reference. Mention in commit message that this is the same file, renamed.
2. **Refresh PROGRESS.md** with current state (repo initialized, services not yet provisioned, plan committed).
3. **Create `DECISIONS.md`** with seed ADRs for the eight decisions in §1.
4. **Add `.env.example`** with all required keys (no values).
5. **Add `.nvmrc` / `engines` field** pinning Node 20.
6. **Add baseline `README.md`** with the one-paragraph identity from CLAUDE.md and a "see /docs/spec.md and /docs/engineering-plan.md" pointer.

---

## 6. Phased build sequence (solo timeline)

Each phase has a single exit criterion. Phases are sized to land in a single commit-and-push session where possible. Where they cannot, the phase has explicit sub-phases.

### Phase 0 — Housekeeping (½ day)
- Items 1–6 from §5.
- Sign-off and commit the engineering plan.

**Exit**: PROGRESS.md, DECISIONS.md, README.md, .env.example, .nvmrc are committed. Spec file renamed.

### Phase 1 — Scaffold & toolchain (1 day)
- `pnpm create next-app` (App Router, TS, Tailwind, ESLint).
- TypeScript strict mode, no `any` rule, no default-export rule outside framework files.
- Prettier config aligned with ESLint.
- Vitest setup with `tests/` mirror layout.
- Drizzle + Drizzle Kit setup. Connect to local Neon branch.
- First migration: empty schema baseline, lock the migration tooling.
- `pnpm db:check`, `pnpm db:push`, `pnpm db:studio` scripts added.
- Vercel build green on push to main. Custom domain attached if DNS has propagated.

**Exit**: A blank Next.js app deploys to a Vercel preview, root URL renders an "XC Posture Check" placeholder, `pnpm test` runs (with 0 tests), `pnpm db:check` confirms Drizzle is connected.

### Phase 2 — Data model & migrations (1 day)
- Implement all 10 tables from spec §DATA MODEL using Drizzle:
  `users`, `share_links`, `assessments`, `assets`, `asset_findings`,
  `inventory_findings`, `events`, `domain_exclusions`, `asn_to_provider_map`,
  `xc_reference_data`.
- UUID v7 helpers in a shared util.
- Zod schemas for each `jsonb` column shape (one place for write-time validation).
- Seed `domain_exclusions` with `.gov`, `.mil`, `.edu` TLD entries.
- Seed `asn_to_provider_map` from the vendored `/data/asn-to-provider.json` (created in phase 4).
- Query functions in `/lib/db/queries/` per table (route handlers/workers never touch Drizzle directly).

**Exit**: `pnpm db:migrate` applies cleanly to a fresh Neon branch. Unit tests cover Zod jsonb schemas with representative fixtures.

### Phase 3 — Auth & seller dashboard skeleton (2 days)
- NextAuth (Auth.js) v5 with Resend magic-link provider.
- Email allowlist logic: `@f5.com` always; `DEV_AUTH_ALLOWLIST` consulted only when `NODE_ENV !== 'production'`.
- Sign-in page (`/sign-in`).
- Magic-link email template (Resend React Email or plain HTML, F5-styled placeholder).
- Authenticated seller layout shell at `/seller` with nav: Dashboard, Share Links, Settings.
- Share-link creation form (prospect company, optional apex domain). Generates a slug from `{first-initial}-{last-name}-{prospect}`.
- `/r/[slug]` placeholder page that loads share link data and renders "Coming soon".

**Exit**: I can sign in via magic link with an allowlisted email, create a share link, copy the URL, open it in a different browser/profile, and land on the placeholder. No probe activity yet.

### Phase 4 — Inventory discovery (inventory probes 1 & 2) (3–4 days)
- Vendor `data/asn-to-provider.json` from public sources (Cloudflare AS13335, Fastly AS54113, Akamai AS16625 family, AWS family, Azure AS8075, GCP AS15169, Oracle, IBM, Imperva, etc.). Aim for ~50 entries to start; expand with usage.
- Vendor `data/xc-pops.json` and `data/waf-signatures.json` (wafw00f-derived) as placeholders for later phases.
- `lib/probes/inventory-discovery.ts`: crt.sh client, dedupe, cap at 500.
- `lib/probes/passive-dns.ts`: SecurityTrails free tier or DNSDumpster scrape.
- `lib/xc/asn-lookup.ts`: ipinfo.io client with 24-hour Redis cache.
- `lib/probes/cloud-classifier.ts`: ASN + CNAME-chain heuristics → provider label with confidence.
- Inngest orchestrator (`workers/orchestrator.ts`) with phase 1 (discovery) and phase 2 (analysis) skeleton — only discovery + classification implemented in this phase.
- POST `/api/assessments/create` route handler: creates the assessment row, enqueues the orchestrator, returns assessment ID.
- GET `/api/assessments/[id]/stream` SSE route: polls assessment progress every 500ms, streams `{phase, progress_percent, status}` to the client.
- `/r/[slug]` page: enter apex domain, click "Run assessment", real-time progress UI, inventory table renders inline.

**Exit**: I run an assessment against `f5evolution.com` (or another known-friendly target) and see a populated asset list with cloud-provider classifications within 60s.

### Phase 5 — Fragmentation Index + per-asset probes 1 & 2 (4–5 days)
- `lib/scoring/fragmentation-index.ts`: weighted geometric mean per spec formula. **Worth-testing** target — extensive unit tests with fixture inventories.
- `lib/scoring/per-asset-grade.ts`: pure function, fully unit-tested.
- `lib/probes/tls.ts`: Node `tls` module, cert chain, protocol matrix, cipher hygiene, HSTS, OCSP. Scoring per spec.
- `lib/probes/waf-headers.ts`: benign probe set, wafw00f signature match, header completeness scoring.
- Asset weight ranking (`lib/scoring/asset-weight.ts`): apex 10, www 9, login/api/admin/etc. 8, others 5. Top-50 selection.
- Orchestrator phase 2 (inventory analysis) and phase 3 (per-asset probes top-50, concurrency 10).
- Report shell with three layers (Your infrastructure / Your fragmentation / Your gaps) — populated for layers A and B; layer C lists assets with TLS + WAF findings only.

**Exit**: A complete assessment surfaces the cloud distribution pie, the Fragmentation Index, and TLS + WAF grades for the top 50 assets.

### Phase 6 — Per-asset probes 3, 4, 5 + edge prober fleet (5–7 days)
- `lib/probes/api-surface.ts`: curated path list, content-type and PII regex checks (Luhn for CC).
- `lib/probes/bot-defense.ts`: UA comparison, form discovery, rate-limit signal (2 probes, 10s apart).
- `edge/probe/[region]/route.ts`: thin Edge Function per region returning DNS/TCP/TLS/TTFB timings. 15 regions deployed via Vercel config.
- `lib/probes/latency.ts`: invoke all 15 regions in parallel, median of 3 per region, cap 150 probes per assessment.
- `lib/xc/pop-distance.ts`: great-circle distance from each prober geo to nearest XC PoP, latency estimation.
- Orchestrator phase 4 (latency probes top-10).
- Coverage matrix data goes into `inventory_findings`.

**Exit**: A complete assessment produces all five per-asset probes plus latency comparison vs XC.

### Phase 7 — Hybrid probes + coverage matrix (3–4 days)
- `lib/probes/bigip-fingerprint.ts`: Server/Cookie/404 signatures across the inventory.
- `lib/probes/cloud-native-exposure.ts`: Kubernetes API, dashboards, admin UIs, exposed DB ports.
- `lib/scoring/coverage-matrix.ts`: matrix computation.
- Coverage matrix table UI grouped by cloud provider.
- F5 footprint callout (rendered prominently when count > 0).
- Shadow IT / high-value / cloud-native filters on the asset list.

**Exit**: A complete assessment renders the full three-layer report including the coverage matrix and F5 footprint callout.

### Phase 8 — Report polish, PDF, attribution, telemetry (5–7 days)
- Apply F5 brand tokens (depends on Dan delivering brand assets).
- Grade badges, narrative panels, technical detail disclosures.
- PDF generation via Playwright. See risk §8 for pattern decision (likely a separate Render/Fly worker or `@sparticuz/chromium` on a Vercel function with extended timeout).
- Seller telemetry events written to `events` table on link click, scan start, scan complete, PDF download, asset drilldown, meeting booked.
- Resend notifications to seller on each meaningful event. Digest scheduler (Inngest cron) for daily/weekly.
- Calendar embed (format depends on Dan's answer to spec open question 2).
- Methodology page at `/methodology` rendered from probe-file constants (`Method`, `Scoring`, `XCTieIn`) so it never drifts from code.
- XC API live integration (token in hand). Cache reference data in `xc_reference_data` with 24h refresh.

**Exit**: A real prospect can run an assessment, download the PDF, and book time with the seller via the embedded calendar. The methodology page is live and accurate.

### Phase 9 — Hardening, anti-abuse, alpha launch (3–5 days)
- Rate limit enforcement via Upstash: anonymous root 1/IP/day, share-link 3/IP/day, same-apex 1/4h, per-target 10rps.
- Visitor IP hashing with daily-rotated salt.
- Audit log retention policy (90 days, scheduled Inngest cleanup).
- Exclusion list UI in seller dashboard (sellers add domains; opt-out email pipeline manual for v2).
- Domain exclusion seed list applied (after Dan delivers it).
- Sentry alerting rules wired.
- Seller leaderboard view.
- 10-seller internal alpha rollout. Personal 30-min onboarding sessions handled by Dan.

**Exit**: Tool is live for the alpha cohort. Telemetry flowing. Sentry quiet.

### Phase 10 — Internal launch + buffer (open-ended)
- Iterate on alpha feedback.
- Co-signed launch email (Dan + John Dumalac).
- 90-second Loom from Dan.
- Demo at next XC field call.

---

## 7. Cross-cutting concerns

### Testing strategy
Per CLAUDE.md "worth testing" list. Concretely:
- Scoring math (`/lib/scoring/`): full coverage with fixture-driven tests.
- Fragmentation Index: edge cases (single asset, all identical, all distinct, missing dimensions).
- ASN classifier: golden tests against `data/asn-to-provider.json`.
- WAF signature matcher: golden tests against captured response fixtures.
- Rate limiter: integration tests against a real Upstash sandbox key.
- Authorization on route handlers: ensures non-allowlisted emails are 403 in production env.
- E2E (Playwright): the seller-creates-link flow and the prospect-runs-assessment flow. Two tests, not a suite.

Skip: React components (except complex interactive ones), Inngest worker orchestration (manual integration test), XC API client (mock in scoring tests).

### Observability
- Sentry: every route handler wraps work in `Sentry.startSpan`; every Inngest function has Sentry instrumentation.
- PostHog: one event per phase transition, one event per user-visible interaction.
- Structured logging: minimal. Logs are for incident response only; product analytics flow through PostHog.

### Performance budgets (per spec)
- 180s hard cap per assessment.
- 2000 HTTP requests max per assessment (250 anonymous, 2000 share-link-attributed per CLAUDE.md).
- 10 rps per target.
- Per-request timeout 5s default.

Orchestrator enforces budgets and marks assessments `partial` when hit.

### Security & ethics
- All probes benign and read-only (spec § ANTI-ABUSE).
- User-Agent: `F5XCPostureCheck/2.0 (contact: postmaster@f5evolution.com)`.
- Honor `robots.txt` for non-probe content fetches.
- Exclusion list checked at orchestrator level before any probe fires.
- Methodology page is a published commitment — changes need explicit Dan approval (CLAUDE.md rule 4).
- Rate-limit caps (250/2000/10rps) need explicit Dan approval to change (CLAUDE.md rule 5).
- `.well-known/security.txt` published with contact email.

---

## 8. Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| R1 | Playwright PDF generation does not fit Vercel function constraints (60s default, memory). | High | Medium | Choose between (a) `@sparticuz/chromium` on a Vercel function with 5-min max duration, or (b) a separate Render/Fly worker. Decide in phase 8 with a spike. Document in DECISIONS.md. |
| R2 | crt.sh availability/rate limiting is inconsistent. | Medium | High | Cache aggressively in Postgres (24h per apex). Add a secondary CT log source (e.g., Censys API free tier) as fallback. |
| R3 | SecurityTrails free tier is rate-limited (50/month). | High | Medium | Treat passive DNS as best-effort enrichment, not blocking. Inventory probe still functions on crt.sh + DNS resolution alone. |
| R4 | Inngest free tier limits at scale (500 scans × ~50 step.run = 25k steps/month). | Low at alpha | Medium at launch | Free tier covers 50k steps/month. Monitor in PostHog. Upgrade to paid tier if alpha throughput exceeds 200 scans/week. |
| R5 | Edge function cold starts inflate latency numbers, biasing the XC comparison. | Medium | High | Pre-warm via a low-frequency Inngest cron pinging each region. Document the warm-up in the methodology page. |
| R6 | XC API endpoint shapes change or are inaccessible at solo dev's permission level. | Medium | Medium | Vendored static fallback always in place. Feature flag `XC_API_LIVE=true`. |
| R7 | Solo timeline slips. | High | Low (no external deadline) | Acceptable. Cut polish first (e.g., leaderboard, daily digest), keep core probes + report. Revisit at end of phase 6. |
| R8 | DNS migration breaks email deliverability briefly. | Low | Medium | Stage: add Vercel NS at registrar over weekend; verify Resend DKIM after propagation before sending real magic links. |
| R9 | `@f5.com` magic-link from Resend hits F5's external-email quarantine. | Medium | High | Test on Dan's F5 mailbox in phase 3. If blocked, request `f5evolution.com` allowlist from F5 IT or use a per-user Outlook calendar link with no email send. |
| R10 | Per-target rate limit math + 10-asset concurrency × 4 probes can exceed 10 rps to a single target on slow assets. | Medium | High | Per-target token bucket in Redis keyed by hostname, enforced inside each probe wrapper. |

---

## 9. Definition of done — applied across phases

A phase is done when:
1. **Exit criterion** in the phase is demonstrably met (I show you a screenshot or a live URL).
2. **Tests** for the "worth testing" surfaces in the phase are green.
3. **PROGRESS.md** updated, **DECISIONS.md** appended for any new ADRs.
4. **`pnpm typecheck`, `pnpm lint`, `pnpm test`** all green.
5. **Commit** lands on `main` with a Conventional Commits message and the auto-deploy completes on Vercel.

---

## 10. What I'm not planning (yet)

Out of v2 scope per spec, kept in mind for future:
- Tier-3 XC Web App Scanning Recon integration (the `verified` flag and DNS TXT challenge — reserved in the data model, UI placeholder only).
- Multi-tenancy / `tenant_id`.
- Public lead-gen funnel (anonymous root scans with marketing attribution).
- Kubernetes Policy Hub convergence (spec open question 8).
- `State of External App Security` data analysis pipeline.

---

## 11. Immediately next

After you sign off on this plan:

1. I execute Phase 0 housekeeping (rename spec → spec.md, update PROGRESS.md, create DECISIONS.md, add .env.example, README, .nvmrc).
2. You work the Pre-build dependency checklist in §2 in parallel.
3. We meet at Phase 1 (scaffold) once at least Neon + Vercel custom domain are in place.

Questions or changes? Comment inline on this file or tell me in chat and I'll revise.
