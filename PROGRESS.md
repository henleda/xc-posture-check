# PROGRESS.md

Running state of the XC Posture Check build. Read at the start of every Claude Code session, update at the end.

Last updated: [DATE]
Current week: Week 0 (pre-build setup)
Current phase: Project kickoff

## Where we are

The project is at day zero. The spec (`/docs/spec.md`) is finalized. CLAUDE.md is in place. The repo has not yet been initialized. No code exists.

The next session begins the week 1 work: scaffolding the Next.js app, wiring up the foundational services, and implementing the inventory discovery phase.

## Complete

Nothing yet. This is the starting state.

## In progress

Nothing yet.

## Blocked

Nothing yet, but two items need resolution before week 1 work begins.

XC API service tenant. Needs provisioning by Yogesh. Dan to start the conversation. Until this resolves, the XC reference data layer falls back to vendored static data, which is acceptable for week 1 but not for v2 launch.

Domain registration. xcposture.io needs to be registered personally by Dan. Cloudflare or Namecheap registrar. Cost is roughly thirty dollars. Five-minute task.

## Decisions made

None yet. The first decisions will surface during week 1 scaffolding (specifically the ClickHouse vs Postgres-only question and the calendar embed format). Record them in DECISIONS.md as they happen.

## Next 3 tasks in order

Task one. Repository initialization. Create the Next.js 14 project with TypeScript and Tailwind. Set up the directory structure per CLAUDE.md. Configure ESLint, Prettier, and TypeScript strict mode. Commit the initial scaffold to a new GitHub repo.

Task two. Service provisioning. Create accounts and projects on Neon, Vercel, Inngest, Upstash, Resend, PostHog, and Sentry. Wire the Vercel project to the GitHub repo. Configure environment variables locally via `.env.local` and on Vercel. Confirm the empty deployed app loads on the Vercel preview URL.

Task three. Auth scaffold. Implement NextAuth with Resend magic link, restricted to @f5.com email domains. Build the sign-in page, the magic link email template, and the authenticated dashboard shell. Confirm a fresh @f5.com address can sign in end to end.

## Known issues and tech debt

None yet.

## Open questions for Dan

These accumulate throughout the build. Dan reviews and answers at the start of each session.

One. Confirm preferred GitHub organization for the repo. Personal account, F5 organization, or a new dedicated organization for PMM tooling? Recommend personal account for v2 speed, migrate later if needed.

Two. Confirm domain registrar choice. Cloudflare and Namecheap both work. Cloudflare bundles free DNS management which the app needs anyway.

Three. Confirm the calendar embed format used by F5 sellers. The seller dashboard needs to know whether to render Calendly, HubSpot Meetings, Chili Piper, or plain Outlook URLs.

## Build sequence reference

The full build sequence is in the spec at `/docs/spec.md`. Quick reference.

Week 1. Foundation and inventory discovery. Scaffold, services, auth, inventory probes one and two.

Week 2. Inventory analysis and first per-asset probes. Fragmentation Index, TLS, WAF.

Week 3. Remaining per-asset probes plus latency fleet. API, Bot, latency edge prober fleet.

Week 4. Hybrid and multi-cloud probes. BIG-IP fingerprinting, cloud-native exposure, coverage matrix.

Week 5. Report polish, PDF, attribution, alpha launch with 10 sellers.

Week 6. Hardening, telemetry depth, internal launch with co-signed email from Dan and John Dumalac.

## Session log

Day zero. Spec finalized at v2. CLAUDE.md and PROGRESS.md created. Repo not yet initialized. Two blockers identified (XC service tenant, domain registration), both five-minute tasks for Dan to clear.
