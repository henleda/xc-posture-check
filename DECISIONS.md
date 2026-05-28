# Architecture Decision Records

Append-only log of decisions that meaningfully shape XC Posture Check. New decisions go at the bottom. Once an ADR is committed it is not deleted; it is superseded by a new ADR if circumstances change. The superseding ADR explicitly names the one it replaces.

Format per CLAUDE.md: status, context, decision, consequences. Brief is fine. The point is that the next person (or future Dan) can reconstruct the why.

---

## ADR-001 — Domain is `f5evolution.com`

Status: Accepted, 2026-05-24.

Context. The spec (`/docs/spec.md`) referred to `xcposture.io` as the public host. Dan registered `f5evolution.com` instead for brand reasons before the build started.

Decision. Use `f5evolution.com` as the production host. Keep the product name "XC Posture Check" — this is a domain-only swap. All URLs, the seller-share short-link domain, the User-Agent string, and the contact email move to the new domain.

Consequences. The spec's references to `xcposture.io` are documentation artifacts; new code uses the new domain via env var (`NEXTAUTH_URL`). The methodology page and email templates reference `f5evolution.com`. Renaming the product or repackaging XC Posture Check is out of scope for v2.

---

## ADR-002 — Solo build cadence; expect 8–10 weeks

Status: Accepted, 2026-05-24.

Context. The spec was sized for two engineers plus Dan over six weeks. The team is currently Dan plus Claude Code.

Decision. Build the full spec scope solo. Plan for 8–10 calendar weeks instead of six. No cuts to features; the timeline expands.

Consequences. Phasing in `/docs/engineering-plan.md` is sequenced for a single builder. Parallelism comes from running probes/edge functions in parallel inside the system, not from parallel humans. If engineers two and three join later, the PR-review rule from CLAUDE.md kicks in and we revisit cadence.

---

## ADR-003 — Postgres-only on Neon; no ClickHouse for v2

Status: Accepted, 2026-05-24.

Context. The spec left ClickHouse on the table for high-cardinality analytics (`asset_findings`, latency probe samples). For v2 traffic volume (low-thousands of assessments, 10–100 assets each) Postgres handles this fine.

Decision. Single Postgres instance on Neon for v2. No ClickHouse. Partition `assets` and `asset_findings` only if cardinality demands it later.

Consequences. One operational surface to monitor and migrate. Simpler local development. If we ever ship XC Posture Check publicly at scale (>50k assessments) we revisit and may add a column store for findings analytics. Resolves spec open question 4.

---

## ADR-004 — Single-tenant data model; no `tenant_id`

Status: Accepted, 2026-05-24.

Context. The tool serves a single team (F5 XC PMM + field sellers) running assessments for prospects. The spec flagged multi-tenancy as an open question.

Decision. No `tenant_id` column. Authorization happens via per-row ownership (`seller_id` on share links and assessments) and route-handler/query-function checks.

Consequences. Schema stays clean. Drizzle queries are simpler. If the tool ever becomes a multi-org SaaS, we record a superseding ADR and run a backfill migration before turning on cross-org features. Confirmed by CLAUDE.md > Database conventions.

---

## ADR-005 — NextAuth restricted to `@f5.com` in production; `DEV_AUTH_ALLOWLIST` in non-prod

Status: Accepted, 2026-05-24.

Context. Sellers must authenticate with their F5 corporate email. Dan and any non-F5 contributors still need a way to sign in locally and in preview environments without an F5 mailbox.

Decision. NextAuth's email-magic-link sign-in enforces an `@f5.com` domain check when `NODE_ENV === "production"`. In non-prod, an additional `DEV_AUTH_ALLOWLIST` env var (comma-separated emails) is honored. The env var is ignored in production regardless of value.

Consequences. Production cannot be opened to non-F5 emails by env var change alone — it requires a code change. Dev/preview can be opened to specific reviewers without touching code. The check lives in a single place in the NextAuth callbacks.

---

## ADR-006 — XC API live integration from day one with vendored static fallback

Status: Accepted, 2026-05-24.

Context. The XC API is needed for read-only reference data (PoP locations, signature counts, threat-campaign counts, Web App Scanning aggregates). Dan confirmed the API token is provisioned before week 0.

Decision. The XC API client wires live calls from week 1. `/data/` carries vendored static snapshots (`xc-pops.json`, etc.) used as a fallback when the API is unreachable or rate-limited, and as the seed for the `xc_reference_data` table on first boot. The 24-hour refresh cadence runs as an Inngest cron.

Consequences. No "stub now, integrate later" refactor. Vendored data is the safety net, not the primary path. Per CLAUDE.md > XC API integration rules, the client is the only file making outbound XC calls and we never query for customer-tenant data.

---

## ADR-007 — DNS managed at Squarespace; nameservers NOT moved to Vercel

Status: Accepted, 2026-05-25. Supersedes the earlier intent (recorded in PROGRESS.md and the v1 draft of the engineering plan) to delegate nameservers to Vercel.

Context. The original plan was to move `f5evolution.com` nameservers from the registrar to Vercel so cert issuance, DNS, and edge config all sat in one pane. Dan executed a different setup before this ADR was written: kept nameservers at Squarespace and pointed records at Vercel — an apex `A` record to Vercel's published IP and a `www` `CNAME` to `cname.vercel-dns.com`. The site resolves and Vercel issues the TLS cert via HTTP-01 validation under this arrangement.

Decision. Leave nameservers at Squarespace. Manage all DNS records at Squarespace. The Vercel project has `f5evolution.com` (and `www.f5evolution.com`) attached so Vercel handles TLS and request routing for both hostnames.

Consequences.
- Two consoles instead of one for DNS-touching work (Squarespace for records, Vercel for project attachment). Acceptable for the record volume this project will have.
- Email sender verification for Resend requires DKIM/SPF TXT records added at Squarespace, not Vercel. Captured as a Phase 3 prerequisite.
- Future subdomain work (e.g., `share.f5evolution.com` for short links if we ever shorten further) is a Squarespace edit plus a Vercel domain attach.
- The decision is reversible: we can move NS to Vercel later with ~24h propagation if the two-pane setup becomes painful.

Canonical hostname is `https://www.f5evolution.com`; apex redirects to `www` via Vercel's domain settings (`www` is set as the primary domain in the Vercel project). `NEXTAUTH_URL` and seller-share URLs use `www`.

**Amendment (2026-05-27):** The original draft of this ADR stated the apex was canonical. The as-built Vercel configuration uses `www` as primary, with the apex 307-redirecting to it. Documenting the actual configuration rather than flipping the redirect — both directions are defensible, and the brand seller-share URLs already in flight haven't been printed anywhere yet, so there is no cost to keeping `www`. If brand later prefers apex, flipping primary in the Vercel dashboard is reversible in minutes.

---

## ADR-008 — Engineering plan committed at `/docs/engineering-plan.md`

Status: Accepted, 2026-05-24.

Context. CLAUDE.md mandates PROGRESS.md updates at session boundaries but does not specify where the multi-week plan lives. Dan prefers plans as committed repo artifacts, not chat-only.

Decision. The build plan lives at `/docs/engineering-plan.md` and is updated as decisions change. PROGRESS.md is the short-form running state; the engineering plan is the long-form sequence and risk register.

Consequences. The plan and PROGRESS.md are both kept current. ADRs go here. The plan can be re-read by future Claude sessions on session start without context loss.

---

## ADR-009 — Seller auth: admin-password gate for the alpha; magic-link abandoned; Entra SSO deferred

Status: Accepted, 2026-05-28. **Supersedes ADR-005** (which specified `@f5.com` email magic-link sign-in).

Context. Phase 3 shipped NextAuth email magic-link sign-in: a seller enters their `@f5.com` address and receives a one-time link from `hello@f5evolution.com` (Resend). In production testing, **every send to an `@f5.com` address bounced** with `550 #5.7.1 Your access to submit messages to this e-mail system has been rejected` — a Microsoft Exchange policy rejection. We verified this is **not** an authentication gap: DKIM was already aligned, and adding a DMARC record (`v=DMARC1; p=none;`) plus apex SPF did not change the result. F5's mail security hard-blocks the `f5evolution.com` sending domain, almost certainly as anti-impersonation/lookalike protection (a domain containing "f5" that isn't `f5.com`, sending login links to F5 employees, reads as credential phishing to F5's own security stack). Because every seller is `@f5.com`, magic-link auth is non-viable for the entire user base, not just one mailbox.

Decision. For the internal alpha, replace seller-by-seller email auth with a **single admin-password gate**:
- NextAuth Credentials provider, one shared `ADMIN_PASSWORD` (constant-time compared), **JWT** session strategy (no DB session storage; the Drizzle adapter is removed).
- The admin (Dan + PMM) signs in and provisions share links centrally. This fits the alpha reality: Dan already curates the 10-seller cohort with John Dumalac.
- **Sellers do not log in.** They become co-branding profiles the admin creates (name, title, avatar, calendar, `@f5.com` contact email) and attributes links to. The prospect-facing assessment flow needs no auth and is unchanged.
- The `@f5.com` rule survives as `isF5Email`, now validating seller-profile emails on creation rather than gating sign-in.

The robust long-term answer — **Microsoft Entra ID SSO** ("Sign in with Microsoft", F5 being a confirmed Microsoft shop) — is **deferred to post-alpha**. It eliminates email entirely, is naturally F5-employee-only, and is what sellers already use daily, but it requires an Entra app registration in F5's tenant (an F5 IT dependency we chose not to block the alpha on).

Consequences.
- The `accounts`, `sessions`, and `verification_tokens` tables (added in migration 0001 for the magic-link adapter) are now **unused**. Left in place; dropping them is a separate deliberate migration, not worth a destructive change mid-pivot.
- The `resend` package stays installed for possible future notifications, but note the same F5 deliverability constraint applies to any mail sent to `@f5.com`.
- Seller self-service (creating their own links, seeing their own telemetry) does not exist until Entra SSO lands. Acceptable for a 10-seller admin-provisioned alpha.
- `ADMIN_PASSWORD` is now a required secret (local `.env.local` + Vercel production & preview).
- This is reversible: the magic-link code is in git history, and Entra SSO is additive when F5 IT is ready.
