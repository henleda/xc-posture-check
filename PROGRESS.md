# PROGRESS.md

Running state of the XC Posture Check build. Read at the start of every Claude Code session, update at the end.

Last updated: 2026-05-26
Current week: Week 0
Current phase: Phase 0 complete; Phase 1 (scaffold) up next

## Where we are

Engineering plan signed off by Dan. Phase 0 housekeeping landed in a single commit: spec renamed to `/docs/spec.md`, `DECISIONS.md` created with eight ADRs, `.env.example`/`.nvmrc`/`README.md` added, `.gitignore` widened to cover `.env*` and `.DS_Store`, and the previously tracked `.DS_Store` untracked.

Vercel project is connected to `f5evolution.com` via DNS records at Squarespace (apex `A` record + `www` `CNAME` to `cname.vercel-dns.com`). Production branch is `main`. Both hostnames are attached to the Vercel project; `www` redirects to apex. Decision recorded as ADR-007 (supersedes the earlier "move NS to Vercel" intent).

`NEON_DATABASE_URL` is in local `.env.local` (gitignored). Other service env vars come from Dan as accounts are provisioned and get mirrored into Vercel preview via `vercel env add ... preview`.

Phase 1 begins next session: `pnpm` init, Next.js 14 + TS strict + Tailwind + Drizzle + Vitest scaffold, push to Vercel, verify production deploy lands at `https://f5evolution.com`.

Domain registered for this project: `f5evolution.com` (not the spec's `xcposture.io`).

## Complete

- Repo initialized; first commit (`81bf44e`) carries the spec and CLAUDE.md.
- GitHub: `henleda/xc-posture-check` private, `origin` set, `main` pushed.
- Git identity set globally to `Daniel Henley <dhenley@utexas.edu>`. Commit `f360df2` author left as `mac.lan` by decision.
- Vercel: CLI authenticated as `dhenley-1255`, project `dan-henleys-projects/xc-posture-check` linked, GitHub auto-deploys configured. `f5evolution.com` and `www.f5evolution.com` attached.
- DNS at Squarespace: apex `A` → Vercel IP, `www` `CNAME` → `cname.vercel-dns.com`. TLS issued via HTTP-01.
- ruflo V3 initialized; `.claude/` and `.mcp.json` committed. `.claude-flow/` and `.vercel/` gitignored.
- Engineering plan committed at `/docs/engineering-plan.md`. Signed off by Dan 2026-05-25.
- **Phase 0 (2026-05-25):**
  - Renamed `/docs/xc-posture-check-spec-v2.md` → `/docs/spec.md`.
  - Created `DECISIONS.md` with ADR-001 through ADR-008. ADR-007 updated to reflect DNS-at-Squarespace.
  - Created `.env.example` with the full required-keys list and dummy values.
  - Created `.nvmrc` pinning Node 20.
  - Created baseline `README.md`.
  - Widened `.gitignore`: `.env*` (except `.env.example`), `.DS_Store`. Untracked the previously committed `.DS_Store`.
  - `NEON_DATABASE_URL` saved to local `.env.local`.

## In progress

Phase 1 scaffold pending Dan's go-ahead on the Phase 0 commit.

## Blocked

- Phase 1 custom-domain-attach step itself is unblocked (domain already attached at Vercel).
- Phase 3 (auth) cannot run end-to-end until Resend is provisioned and `f5evolution.com` sender DKIM/SPF records are added at Squarespace.
- Phase 8 (PDF) needs a decision spike on Playwright runtime location (Vercel function vs separate worker).

## Decisions made

ADRs are now formalized in `DECISIONS.md`. Summary (see file for context and consequences):

1. ADR-001 — Domain is `f5evolution.com`, not `xcposture.io`. Product name unchanged.
2. ADR-002 — Solo cadence; 8–10 week timeline.
3. ADR-003 — Postgres-only on Neon. No ClickHouse for v2.
4. ADR-004 — Single-tenant data model.
5. ADR-005 — NextAuth `@f5.com` in prod; `DEV_AUTH_ALLOWLIST` in non-prod.
6. ADR-006 — XC API live integration from day one with vendored static fallback.
7. ADR-007 — **DNS managed at Squarespace**, nameservers NOT moved to Vercel (supersedes the original "move NS to Vercel" intent).
8. ADR-008 — Engineering plan committed at `/docs/engineering-plan.md`.

## Next 3 tasks in order

Task one. Phase 1 scaffold. `pnpm init`, Next.js 14 App Router + TS strict + Tailwind 3.4, Drizzle ORM + Drizzle Kit, Vitest, ESLint/Prettier, `pnpm db:check` script, baseline `app/page.tsx`, push to GitHub, verify Vercel preview build green. Single commit per logical step.

Task two. In parallel, Dan continues the pre-build checklist (`/docs/engineering-plan.md` §2): provision Inngest, Upstash, Resend, Sentry, PostHog, AWS S3, ipinfo.io with F5 email; capture env vars; deliver F5 brand assets; decide calendar embed format.

Task three. Phase 2 — Drizzle schema + initial migration for the ten tables defined in the spec (assessments, share_links, sellers, assets, asset_findings, latency_samples, xc_reference_data, audit_log, prober_results, hybrid_findings). Zod schemas for all `jsonb` columns. Query layer skeleton.

## Known issues and tech debt

- Commit `f360df2` author is `Daniel Henley <danielhenley@mac.lan>` (pre-git-config-set). Left as-is by decision.
- Service credentials (Neon, Upstash, Sentry, PostHog) were shared in chat plaintext. Live only in `.env.local` and Vercel preview env (encrypted). If Dan wants belt-and-suspenders, rotate each from its respective console before launch.
- **Neon branch split before production**: Vercel preview currently points at the same Neon branch as local dev. Before any production data exists, create a dedicated Neon branch for one side (prod or preview) so PR previews never write into production. See `vercel env rm NEON_DATABASE_URL preview && vercel env add NEON_DATABASE_URL preview` to swap.

## Open questions for Dan

These accumulate. Dan reviews at the start of each session.

One. Calendar embed format (Calendly / HubSpot / Chili Piper / Outlook). Determines Phase 8 seller dashboard work. Spec open question 2.

Two. F5 brand assets timing (logo SVG, color tokens, typography). Needed for Phase 8. Is there a brand-team gate? Spec open question 5.

Three. ASN-to-provider mapping refresh cadence. Spec recommends quarterly from IPinfo / Hurricane Electric BGP toolkit. Acceptable to start with a vendored snapshot and revisit at v2 launch?

Four. Internal alpha cohort timing. Spec calls for 10 sellers picked by John Dumalac. Recommend after Phase 6.

## Build sequence reference

Full plan in `/docs/engineering-plan.md`. Quick map:

- ✅ Phase 0: Housekeeping (½ day) — file renames, PROGRESS/DECISIONS/README/env.example/nvmrc.
- ▶ Phase 1: Scaffold & toolchain (1 day) — Next.js 14, TS strict, Tailwind, Drizzle, Vitest, deploy.
- Phase 2: Data model & migrations (1 day) — 10 tables, Zod jsonb schemas, query layer.
- Phase 3: Auth & seller dashboard skeleton (2 days) — NextAuth + Resend, share link CRUD.
- Phase 4: Inventory discovery (3–4 days) — inventory probes 1 & 2, SSE progress.
- Phase 5: Fragmentation Index + per-asset 1 & 2 (4–5 days) — scoring math (worth-testing), TLS, WAF.
- Phase 6: Per-asset 3, 4, 5 + edge prober fleet (5–7 days) — API, Bot, Latency, 15 regions.
- Phase 7: Hybrid probes + coverage matrix (3–4 days) — BIG-IP, cloud-native, matrix.
- Phase 8: Report polish, PDF, attribution, telemetry (5–7 days) — brand, Playwright, methodology page.
- Phase 9: Hardening + alpha (3–5 days) — rate limits, audit log, 10-seller rollout.
- Phase 10: Internal launch + buffer.

## Session log

Day zero (2026-05-24).
- Initial spec and CLAUDE.md committed (existing prior to session).
- Set up GitHub remote: created `henleda/xc-posture-check` private, pushed `main`.
- Authenticated Vercel CLI (`dhenley-1255`), linked project to repo with GitHub integration.
- Set global git identity (`Daniel Henley <dhenley@utexas.edu>`); left the prior `mac.lan` commit as-is.
- Ran `npx ruflo@latest init`; committed `.claude/` integration and `.mcp.json`; gitignored `.claude-flow/` and `.vercel/`.
- Drafted engineering plan with 8 baked-in decisions, 10 build phases, risk register, cross-cutting concerns. Committed at `/docs/engineering-plan.md` awaiting sign-off.

Day one (2026-05-25).
- Dan provided the Neon connection string in chat; saved to `.env.local` (gitignored).
- Widened `.gitignore` to cover `.env*` (except `.env.example`) and `.DS_Store`. Untracked one previously committed `.DS_Store`.
- Confirmed Vercel setup: domain attached, DNS at Squarespace (apex A + www CNAME), production branch `main`. Recorded as ADR-007.
- Dan signed off on the engineering plan.
- Executed Phase 0 housekeeping: renamed spec to `/docs/spec.md`, created `DECISIONS.md` (ADR-001..008), `.env.example`, `.nvmrc`, `README.md`. Updated PROGRESS.md.

Day two (2026-05-26).
- Dan provided Upstash Redis REST credentials. Stored locally in `.env.local`; mirrored to Vercel preview env via `vercel env add ... preview`.
- Aligned Upstash env var names to the Upstash SDK convention (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) so `Redis.fromEnv()` works without glue. Updated `.env.example` and `CLAUDE.md` to match.
- Mirrored `NEON_DATABASE_URL` to Vercel preview env (currently the same Neon branch as local; will split into a preview-specific branch before production data exists — see Known issues).
- Provisioned Sentry. `SENTRY_DSN` stored locally and mirrored to Vercel preview.
- Provisioned PostHog (Cloud US). Aligned to `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` so the SDK can autocapture client-side. Updated `.env.example` and `CLAUDE.md` to match. Values mirrored to Vercel preview.
- All Phase 1 hard and soft dependencies are now satisfied. Ready to scaffold.
- **Ruflo auto-install incident.** Around 11:26 local, the ruflo MCP server autonomously ran `npm install @sentry/node --save` from the project root (verified via `~/.npm/_logs/`), creating `package.json`, `package-lock.json`, and `node_modules/`. Triggered by mentions of Sentry in `.env.local`. Wrong package for our stack (`@sentry/nextjs` is correct for Next.js App Router) and unauthorized. Deleted all three artifacts. Added `node_modules/` to `.gitignore` as a defensive guard. Decision deferred on whether to disable ruflo's PostToolUse hooks and `claudeFlow` auto-flags — Dan opted to leave settings.json untouched for now and re-evaluate if another silent mutation occurs.
