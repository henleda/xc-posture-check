# PROGRESS.md

Running state of the XC Posture Check build. Read at the start of every Claude Code session, update at the end.

Last updated: 2026-05-24
Current week: Week 0 (pre-build setup)
Current phase: Plan drafted, awaiting Dan's sign-off before Phase 0 execution

## Where we are

Day-zero scaffolding completed: repo initialized, GitHub remote connected (`henleda/xc-posture-check`, private), Vercel project linked (`dan-henleys-projects/xc-posture-check`), ruflo Claude Code integration installed. Engineering plan committed at `/docs/engineering-plan.md` and is in draft awaiting Dan's review.

The next session begins with Dan reviewing the plan. If approved as-is, the first action is Phase 0 housekeeping (rename spec, refresh PROGRESS, create DECISIONS.md, add .env.example/README/.nvmrc). In parallel, Dan works the pre-build service-provisioning checklist in `/docs/engineering-plan.md` §2.

Domain registered for this project: `f5evolution.com` (not the spec's `xcposture.io`). Decision: domain-only swap, product name stays "XC Posture Check". DNS will move to Vercel.

## Complete

- Repo initialized; first commit (`81bf44e`) carries the spec and CLAUDE.md.
- GitHub: `henleda/xc-posture-check` private repo created via `gh repo create`, set as `origin`, `main` pushed.
- Git identity set globally to `Daniel Henley <dhenley@utexas.edu>`. The first commit `f360df2` shows the auto-detected `mac.lan` author; left as-is by decision.
- Vercel: CLI authenticated as `dhenley-1255`, project linked (`dan-henleys-projects/xc-posture-check`), GitHub repo connected for auto-deploys.
- ruflo V3 initialized; `.claude/` (skills, agents, commands, helpers, settings) and `.mcp.json` committed. `.claude-flow/` and `.vercel/` are gitignored.
- Engineering plan drafted and committed at `/docs/engineering-plan.md`.

## In progress

Dan reviewing the engineering plan. No code work has started.

## Blocked

Phase 1 (scaffolding) cannot complete the custom-domain attach step until DNS NS move propagates. Phase 1 build itself is not blocked — Vercel default URL works.

Phase 3 (auth) cannot run end-to-end until Resend is provisioned and the F5 mail delivery test passes (see plan risk R9).

Phase 8 (PDF) needs a decision spike on Playwright runtime location (Vercel function vs separate Render/Fly worker).

## Decisions made

These eight decisions are baked into the engineering plan and will be formalized as ADRs in `DECISIONS.md` during Phase 0:

1. Domain is `f5evolution.com`, not `xcposture.io`. Product name stays "XC Posture Check".
2. Solo build cadence; 8–10 weeks expected for full spec scope.
3. Postgres-only on Neon; no ClickHouse.
4. Single-tenant data model; no `tenant_id`.
5. NextAuth restricted to `@f5.com` in production; `DEV_AUTH_ALLOWLIST` env var honored only when `NODE_ENV !== 'production'`.
6. XC API token already provisioned (Dan confirmed); plan wires live integration from day 1 with vendored static fallback always available.
7. DNS managed by Vercel (move nameservers from current registrar).
8. Engineering plan committed at `/docs/engineering-plan.md`; updated as it evolves.

## Next 3 tasks in order

Task one. Dan reviews `/docs/engineering-plan.md` and either signs off or comments inline / in chat. If revisions wanted, Claude updates and re-commits.

Task two. On sign-off, Claude executes Phase 0 housekeeping (single commit):
- Rename `/docs/xc-posture-check-spec-v2.md` → `/docs/spec.md` (matches CLAUDE.md reference).
- Refresh PROGRESS.md to reflect Phase 0 complete.
- Create `DECISIONS.md` with ADRs for the 8 baked-in decisions.
- Add `.env.example` with all required keys, no values.
- Add `.nvmrc` pinning Node 20.
- Add baseline `README.md`.

Task three. In parallel with task two, Dan works the pre-build checklist (`/docs/engineering-plan.md` §2): move NS to Vercel, provision Neon/Inngest/Upstash/Resend/Sentry/PostHog with F5 email, capture env vars, deliver F5 brand assets, decide calendar embed format.

## Known issues and tech debt

- PROGRESS.md previously referenced `/docs/spec.md` but the actual file was `/docs/xc-posture-check-spec-v2.md`. Will be reconciled in Phase 0 by renaming the file (not the reference).
- Commit `f360df2` author is `Daniel Henley <danielhenley@mac.lan>` (pre-git-config-set). Left as-is by decision.

## Open questions for Dan

These accumulate. Dan reviews at the start of each session.

One. Calendar embed format. Calendly, HubSpot Meetings, Chili Piper, or Outlook? Determines week-6/Phase 8 seller dashboard work. Spec open question 2.

Two. F5 brand assets timing. Logo SVG, color tokens, typography. Needed for Phase 8. Is there a brand-team gate? Spec open question 5.

Three. ASN-to-provider mapping refresh cadence. Spec recommends quarterly from IPinfo / Hurricane Electric BGP toolkit. Acceptable to start with a vendored snapshot and revisit at v2 launch?

Four. Internal alpha cohort timing. Spec calls for 10 sellers picked by John Dumalac. When does Dan want to start that conversation? Recommend after Phase 6 (per plan).

## Build sequence reference

Full plan in `/docs/engineering-plan.md`. Quick map:

- Phase 0: Housekeeping (½ day) — file renames, PROGRESS/DECISIONS/README/env.example/nvmrc.
- Phase 1: Scaffold & toolchain (1 day) — Next.js 14, TS strict, Tailwind, Drizzle, Vitest, custom domain.
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
- Drafted engineering plan with 8 baked-in decisions, 10 build phases, risk register, cross-cutting concerns. Plan committed at `/docs/engineering-plan.md` awaiting Dan's sign-off.
