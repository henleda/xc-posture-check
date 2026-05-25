# XC Posture Check

Public-facing security posture assessment tool for the F5 Distributed Cloud (XC) sales motion. A prospect enters their apex domain; the tool maps their external attack surface across every cloud and edge provider it finds, scores fragmentation, and surfaces protection gaps per asset. Reports are co-branded with the F5 field seller who shared the link.

Production: <https://f5evolution.com>

## Status

Pre-build. Phase 0 (housekeeping) is in progress. See `PROGRESS.md` for the latest state. See `/docs/engineering-plan.md` for the full build sequence.

## Read these first

| File | Purpose |
|------|---------|
| [`/docs/spec.md`](docs/spec.md) | Product specification. Source of truth for scope, scoring, and methodology. |
| [`/docs/engineering-plan.md`](docs/engineering-plan.md) | Multi-week build plan, phasing, and risk register. |
| [`PROGRESS.md`](PROGRESS.md) | Running state. Updated every session. Read at session start. |
| [`DECISIONS.md`](DECISIONS.md) | Architecture decision records. Append-only. |
| [`CLAUDE.md`](CLAUDE.md) | Instructions for Claude Code: conventions, hard rules, session ritual. |

If the spec and `CLAUDE.md` conflict, the spec wins. If the engineering plan and `CLAUDE.md` conflict, `CLAUDE.md` wins. If anything in this repo and a direct ask from Dan conflict, ask Dan to confirm before proceeding.

## Tech stack

Node 20 LTS · Next.js 14 (App Router) · TypeScript 5.3 strict · React 18 · Tailwind 3.4 · Postgres 16 on Neon · Drizzle ORM · Inngest · Upstash Redis · NextAuth 5 · Resend · Playwright · PostHog · Sentry · S3 · Vercel.

Versions are pinned in `package.json` and not upgraded without a `DECISIONS.md` entry.

## Local development

The Next.js scaffold lands in Phase 1. Quickstart will be:

```bash
nvm use                # picks Node 20 from .nvmrc
pnpm install           # install deps
cp .env.example .env.local   # fill in real values
pnpm db:check          # verify migrations against the local DB
pnpm dev               # http://localhost:3000
```

Environment variables required for local dev are listed in `.env.example`. Real values come from Dan; never commit a real `.env.local`.

## Hosting

Hosted on Vercel under the personal team `dan-henleys-projects/xc-posture-check`. Auto-deploys on push to `main` (production) and on every PR (preview). DNS is at Squarespace; both apex (`f5evolution.com`) and `www` are attached to the Vercel project, with `www` redirecting to apex. See `DECISIONS.md` ADR-007 for context.

## Repository conventions

Conventional Commits. Branch names `dan/feature-name`. PRs not required for solo work; that changes when the second engineer joins.

The "five things to never do" in `CLAUDE.md` apply absolutely: no destructive DB ops outside migrations, no force pushes to `main`, no committed secrets, no unreviewed changes to the published methodology page, no changes to the probe budget caps without explicit approval.

## Contact

Dan Henley · F5 XC Product Marketing · <dhenley@utexas.edu>
