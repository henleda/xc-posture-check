# PROGRESS.md

Running state of the XC Posture Check build. Read at the start of every Claude Code session, update at the end.

Last updated: 2026-05-28
Current week: Week 1
Current phase: Phase 3b (auth pivot) — code complete, opening PR #4. Phase 4 (inventory discovery) is next.

## Where we are

Phases 0–3 are merged to `main` and deployed. Phase 3b (this PR) pivots seller auth after a hard blocker surfaced (below). The live site is `https://www.f5evolution.com` (Vercel project `xc-posture-check-y7nh`).

**The auth pivot (ADR-009).** Phase 3 shipped magic-link email sign-in. It does not work: every magic-link email to an `@f5.com` address bounces with `550 5.7.1` — F5's Microsoft Exchange policy hard-blocks the `f5evolution.com` sending domain (anti-impersonation; a non-`f5.com` domain containing "f5" emailing F5 employees login links reads as phishing). Adding DMARC + apex SPF did not help — it's a policy block, not an auth gap. Since every seller is `@f5.com`, magic links are non-viable for the whole user base. Phase 3b replaces it with a **single admin-password gate** (Credentials + JWT): the admin (Dan + PMM) provisions share links centrally; sellers are co-branding profiles, not logins. Microsoft Entra ID SSO is the deferred post-alpha path for seller self-service (needs an F5-tenant app registration).

## Complete

- **Phase 0** (PR pre-history, on `main`): housekeeping — spec→`/docs/spec.md`, DECISIONS.md, README, `.env.example`, `.nvmrc`.
- **Phase 1** (merged): Next.js 14 + TS strict + Tailwind 3.4 + Drizzle + Vitest + Sentry + PostHog scaffold. Live on Vercel.
- **Phase 2** (PR #2, merged): 10-table Drizzle data model, migration 0000, Zod jsonb validators (per-type schema maps), query layer for users/share-links/assessments/events.
- **Phase 3** (PR #3, merged): NextAuth magic-link (now superseded), seller dashboard, share-link CRUD, prospect `/r/[slug]` landing, `build:vercel` migration deploy hook. Migration 0001 (auth tables).
- **Phase 3b** (this PR, `dan/phase-3b-admin-auth`): admin-password auth (Credentials + JWT, no adapter), admin dashboard (all links), inline seller-profile creation, prospect page unchanged. 22 tests passing; build green; smoke-tested locally (login → dashboard → forms).

## Infrastructure state (hard-won; see ADRs + memory)

- **Vercel:** ONE project — `xc-posture-check-y7nh` (`prj_cForpwOaojzbzD7KX25cEvRwPEZX`). The `-y7nh` suffix is intentional; a duplicate orphan `xc-posture-check` was deleted 2026-05-27 after env vars had been going to the wrong project for several phases. CLI is linked to `-y7nh`.
- **Neon:** `production` branch = `ep-wandering-base-apjdf6ke` (has migrations 0000+0001 via the production deploy). `preview` branch = `ep-jolly-credit-ap2wghv0` (recreated 2026-05-28 — the prior `ep-bitter-boat` preview branch **vanished** from Neon, cause TBD). Preview is a CoW clone of production so it inherits the schema. Local dev + Vercel preview → preview branch; Vercel production → production branch.
- **Env vars:** 10 on `-y7nh` production, 9 on preview (NEON, UPSTASH×2, SENTRY, POSTHOG×2, RESEND, NEXTAUTH_SECRET, ADMIN_PASSWORD; production also has NEXTAUTH_URL). All mirrored to local `.env.local`.
- **Migrations:** `build:vercel` runs `drizzle-kit migrate` before `next build` on every Vercel deploy, against that environment's branch.

## In progress

Phase 3b PR #4 about to open. After merge: Phase 4.

## Blocked / deferred

- **Microsoft Entra ID SSO** (seller self-service) — deferred post-alpha; needs an Entra app registration in F5's tenant (F5 IT dependency).
- **Phase 8 PDF** — still needs a Playwright runtime-location spike (Vercel fn vs separate worker).

## Decisions made (in DECISIONS.md)

ADR-001 domain swap · ADR-002 solo cadence · ADR-003 Postgres-only · ADR-004 single-tenant · ADR-005 `@f5.com` magic link **(SUPERSEDED by ADR-009)** · ADR-006 XC API live+fallback · ADR-007 DNS at Squarespace, canonical=www · ADR-008 engineering plan location · **ADR-009 admin-password auth for alpha; magic-link abandoned (F5 mail block); Entra SSO deferred.**

## Next 3 tasks in order

Task one. Merge PR #4 (Phase 3b). Watch the production deploy go green.

Task two. **Phase 4 — inventory discovery.** Inventory probe 1 (asset discovery via crt.sh + passive DNS, resolve IPs/ASN) and probe 2 (cloud/edge classification via ASN + CNAME + BIG-IP header signatures). SSE progress UI. Inngest orchestrator skeleton. This is where `INNGEST_*` and `IPINFO_TOKEN` env vars are first needed — provision before starting.

Task three. Wire the prospect `/r/[slug]` "Run check" button to kick off an assessment (currently disabled). Connects the seller→prospect→assessment flow end-to-end.

## Known issues and tech debt

- **`.env.example` is missing `ADMIN_PASSWORD`** — the harness blocks Claude from writing `.env.*` files, so Dan should add `ADMIN_PASSWORD="..."` to `.env.example` manually (the auth section also still references magic-link/DEV_AUTH_ALLOWLIST and should be updated to match ADR-009).
- **Unused auth tables:** `accounts`, `sessions`, `verification_tokens` (migration 0001) are dead after the JWT pivot. Drop in a future deliberate migration.
- **Neon preview-branch durability:** the preview branch vanished once. If it recurs, reconsider the branch-split approach (or point preview at production until real data exists). Find out *why* it vanished.
- Commit `f360df2` author is `mac.lan` (pre-git-config). Left as-is.
- Credentials (Neon/Upstash/Sentry/PostHog/Resend/ADMIN_PASSWORD) were shared in chat; rotate from each console before public launch if desired.
- Local Node is 25; prod/CI is Node 20 (`engines`). Watch for version-specific surprises.

## Open questions for Dan

1. Why did the Neon `preview` branch disappear? (Plan branch limits / inactivity expiry / manual?) Determines whether the branch-split is durable.
2. Calendar embed format (Calendly / HubSpot / Chili Piper / Outlook) — Phase 8.
3. F5 brand assets timing (logo, fonts, color tokens) — Phase 8.
4. Entra SSO: when to start the F5 IT app-registration conversation for post-alpha seller self-service.
5. Alpha cohort timing with John Dumalac (recommend after Phase 6).

## Build sequence reference

Full plan in `/docs/engineering-plan.md`.

- ✅ Phase 0: Housekeeping
- ✅ Phase 1: Scaffold & toolchain
- ✅ Phase 2: Data model & migrations
- ✅ Phase 3: Auth & seller dashboard (auth pivoted in 3b)
- ▶ Phase 3b: Admin-password auth pivot (this PR)
- Phase 4: Inventory discovery (probes 1 & 2, SSE progress)
- Phase 5: Fragmentation Index + per-asset TLS/WAF
- Phase 6: Per-asset API/Bot/Latency + 15-region edge fleet
- Phase 7: Hybrid probes + coverage matrix
- Phase 8: Report polish, PDF, attribution, telemetry
- Phase 9: Hardening + alpha
- Phase 10: Internal launch + buffer

## Session log

Day zero (2026-05-24). Spec + CLAUDE.md; GitHub remote; Vercel CLI; ruflo init; engineering plan drafted.

Day one (2026-05-25). Neon connection string saved; `.gitignore` widened; DNS-at-Squarespace confirmed (ADR-007); engineering plan signed off; Phase 0 housekeeping.

Day two (2026-05-26). Upstash, Sentry, PostHog provisioned + mirrored to Vercel preview; SDK-convention env names; ruflo auto-installed `@sentry/node` (deleted, gitignored node_modules).

Days three–four (2026-05-27/28).
- Phase 1 scaffold shipped (PR e7f97a1 + fixes); Vercel framework-preset fix (`vercel.json`).
- Discovered + resolved the **two-Vercel-project** mess: live project is `xc-posture-check-y7nh`; deleted orphan `xc-posture-check`; mirrored all env vars to `-y7nh`. Saved memory `project-vercel-topology`.
- Neon branch split (production vs preview); preview later vanished and was recreated as `ep-jolly-credit-ap2wghv0`.
- Phase 2 (PR #2) and Phase 3 (PR #3) merged; production deploy applied migrations 0000+0001.
- **Magic-link auth proven non-viable**: F5 Exchange bounces `f5evolution.com` mail with 550 5.7.1; DMARC+SPF didn't fix it (policy/impersonation block).
- **Phase 3b auth pivot** to admin-password (Credentials+JWT); ADR-009 supersedes ADR-005. Brought PROGRESS.md current (it had drifted since day two).
