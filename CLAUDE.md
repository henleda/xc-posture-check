# CLAUDE.md

This file provides instructions for Claude Code when working in this repository. Read it at the start of every session.

## Project identity

XC Posture Check is a public-facing security posture assessment tool for the F5 Distributed Cloud (XC) sales motion. A prospect enters their apex domain, the tool maps their full external attack surface across all cloud and edge providers, scores fragmentation across that inventory, and surfaces protection gaps per asset. Reports are co-branded with the F5 field seller who shared the link.

The tool exists to make XC easier to sell by making the multi-cloud reality of prospect environments visible, and to make the XC PMM team visible to the F5 field. It is a field enablement and brand asset built by Product Marketing. It is not a product owned by engineering and is hosted outside the XC SKU surface.

The full product specification lives in `/docs/spec.md`. Read it first.

The running state of the build lives in `/PROGRESS.md`. Read it at the start of every session and update it at the end.

## Tech stack with exact versions

Node 20 LTS.
Next.js 14 with the App Router.
TypeScript 5.3 plus, strict mode on.
React 18.
Tailwind CSS 3.4.
Postgres 16 hosted on Neon.
Drizzle ORM for database access. No Prisma.
Inngest for background job orchestration.
Upstash Redis for rate limiting and probe-result caching.
NextAuth 5 (Auth.js) for seller auth with email magic link.
Resend for transactional email.
Playwright for PDF generation.
PostHog for product analytics.
Sentry for error monitoring.
S3 for PDF and artifact storage.
Vercel for hosting and the 15-region edge prober fleet.

Lock these versions in package.json. Do not upgrade without an explicit decision recorded in DECISIONS.md.

## Directory structure

```
/
  app/                    Next.js App Router routes
    (marketing)/          Public marketing pages
    (seller)/             Authenticated seller dashboard
    r/[slug]/             Prospect-facing share link pages
    api/                  Route handlers
    methodology/          Public methodology page
  components/             React components, organized by feature
  lib/                    Shared utilities
    db/                   Drizzle schema and queries
    probes/               Probe implementations, one file per probe
    xc/                   XC API client and reference data
    scoring/              Scoring and grade computation
    report/               Report generation logic
  workers/                Inngest job definitions
    discovery/            Inventory discovery phase
    analysis/             Inventory analysis phase
    probes/               Per-asset probe orchestration
    latency/              Edge prober orchestration
    hybrid/               Hybrid and multi-cloud probes
  edge/                   Edge prober Next.js functions
  data/                   Vendored static data
    asn-to-provider.json  ASN to cloud or edge provider mapping
    xc-pops.json          XC PoP location fallback data
    waf-signatures.json   Vendored wafw00f signature database
  scripts/                One-off scripts, migrations, data refreshers
  docs/
    spec.md               Product specification, source of truth
  tests/                  Test files mirroring source structure
  PROGRESS.md             Running build state
  DECISIONS.md            Architecture decision records
  CLAUDE.md               This file
```

Do not create new top-level directories without recording the decision in DECISIONS.md.

## Naming conventions

Files. kebab-case for all files. Components match the kebab-case of the component name. Example, `policy-fragmentation-gauge.tsx`.

Components. PascalCase for component names. Example, `PolicyFragmentationGauge`.

React hooks. camelCase prefixed with `use`. Example, `useAssessmentStatus`.

Database tables. snake_case, plural. Example, `share_links`, `asset_findings`.

Database columns. snake_case. Example, `prospect_company`, `overall_grade`.

Route paths. kebab-case. Example, `/api/assessments/create`.

Environment variables. SCREAMING_SNAKE_CASE. Example, `NEON_DATABASE_URL`, `XC_API_TOKEN`.

Inngest function IDs. kebab-case prefixed with category. Example, `discovery/enumerate-subdomains`, `probe/tls-asset`.

## Code style

TypeScript strict mode is on. No `any` without a `// reason:` comment explaining why.

No default exports outside Next.js page and layout files where the framework requires them.

Prefer `function` declarations over `const` arrow assignments for top-level functions.

Error handling. Throw typed errors. Catch at the route handler or Inngest worker boundary. Log via Sentry. Never swallow errors silently.

Database access. All queries through Drizzle in `/lib/db/queries/`. No raw SQL except in migrations. No Drizzle calls in route handlers, route handlers call query functions.

Async patterns. Use `Promise.all` for parallel work. Use `Promise.allSettled` when individual failures should not abort the batch (this applies to per-asset probes).

Imports. Absolute imports from `@/` for everything inside the project. Relative imports only for files in the same directory.

Comments. Comment why, not what. If the code needs a comment to explain what it does, rewrite the code. Exception, probe implementations include a header comment with method, scoring formula, and XC tie-in for documentation alignment with the spec.

## Testing approach

Test what matters. Skip what doesn't.

Worth testing.
Scoring and grade computation in `/lib/scoring/`. Pure functions with clear inputs and outputs.
Fragmentation Index computation. Numeric correctness matters.
ASN-to-provider classification logic.
Probe response parsers, especially WAF fingerprint matching.
Rate limit enforcement.
Authorization checks on route handlers.

Skip testing.
React components, except complex interactive ones.
Inngest worker orchestration code, integration test these manually.
The XC API client (mock the responses in scoring tests).

Framework. Vitest for unit tests. Playwright for end-to-end on critical seller and prospect flows only.

Coverage target. None. Hit the worth-testing list, ignore the rest.

## Database conventions

Migrations. Drizzle Kit generates migrations. Migration files committed to `/lib/db/migrations/`. Never edit a migration after it has been applied to staging or production.

Tenancy. The data model is single-tenant in v2. Do not add a `tenant_id` column. If we ever go multi-tenant (the spec flags this as an open question), record the decision in DECISIONS.md first.

RLS. Not used. Authorization happens in route handlers and query functions. If RLS later becomes appropriate, record the decision.

IDs. UUIDs (v7 where possible for sortability). No auto-increment integers.

Timestamps. `created_at` and `updated_at` on every table. Use `timestamp with time zone`.

Soft deletes. Not by default. Add `deleted_at` only when audit history is required.

JSON columns. Use `jsonb`, never `json`. Type the shape in TypeScript and validate with Zod on write.

## Secrets handling

All secrets in environment variables. Nothing in code, nothing in commit history.

Local development. `.env.local` (gitignored). `.env.example` committed with all required keys and dummy values.

Production. Vercel environment variables.

Required env vars at v2 launch.
NEON_DATABASE_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
RESEND_API_KEY
NEXTAUTH_SECRET
NEXTAUTH_URL
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
SENTRY_DSN
POSTHOG_API_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET
XC_API_TOKEN
XC_TENANT_NAME
IPINFO_TOKEN

If any secret accidentally lands in a commit, stop work immediately, rotate the key, and force-cleanup the history with permission from Dan.

## Commit and PR conventions

Conventional Commits. Examples, `feat(probes): add cloud-native exposure detection`, `fix(scoring): correct fragmentation weight normalization`.

Branch names. `dan/feature-name` or `eng-name/feature-name`. No long-lived feature branches, rebase frequently.

PRs not required for solo work. Required when the second and third engineers join. At that point, every PR gets one review.

Never force push to `main`.

## The five things to never do

One. Drop or truncate database tables outside migrations.

Two. Force push to `main` or any branch with another contributor's work.

Three. Commit secrets, API keys, or production data samples. If unsure whether something is sensitive, ask Dan before committing.

Four. Modify the methodology page copy (`/app/methodology/page.tsx`) without Dan's explicit approval. The published methodology is a public commitment and changes must be deliberate.

Five. Modify the probe request budget caps (250 anonymous, 2000 authenticated) or the per-target rate limit (10 rps) without Dan's explicit approval. These are ethical and legal guardrails.

## Probe development rules

Every probe lives in `/lib/probes/` as its own file. Filename matches the probe name in the spec, kebab-cased.

Every probe file exports.
A `run(input): Promise<ProbeResult>` function.
A `Method` string constant describing the technical method.
A `Scoring` object describing the scoring formula.
A `XCTieIn` string with the XC narrative tied to the probe.

These constants get imported by the methodology page renderer so the published methodology stays in sync with the code automatically. Do not let the methodology page and the probe code drift.

Every probe respects.
The total request budget for the assessment (passed in as a remaining-budget number).
The per-target rate limit (10 rps).
Per-request timeouts (5 seconds default, configurable per probe).
The exclusion list (checked at the orchestrator level before probes fire).

Every probe is benign and read-only. No active exploitation. No malformed payloads. No real credentials. If a probe needs a synthetic payload, use a known-benign pattern documented in the methodology page.

## XC API integration rules

The XC API client lives in `/lib/xc/client.ts`. Only this file makes outbound XC API calls. Workers and routes import from `/lib/xc/`.

The XC API is used only for read-only reference data: PoP locations, signature counts, threat campaign counts, aggregate Web App Scanning reference data.

Never call the XC API for customer-tenant data.

Never store XC API responses containing customer-specific information.

Cache XC reference data in the `xc_reference_data` table with a `fetched_at` timestamp. Refresh on a 24-hour cadence. Fall back to vendored static data in `/data/` if the API is unreachable.

## Working with Inngest

Long-running work happens in Inngest workers, never in route handlers.

Route handlers create an assessment record, enqueue the orchestrator job, and return immediately with the assessment ID.

The orchestrator job runs the six phases sequentially: discovery, inventory analysis, per-asset probes, latency probes, hybrid probes, finalization. Each phase updates the `phase` and `progress_percent` columns on the assessment.

Per-asset probes fan out with concurrency limit of 10. Use Inngest's `step.run` with parallel arrays.

Latency probes fan out across 15 regions in parallel. Hard cap of 150 latency probes per assessment.

Total assessment time budget is 180 seconds. The orchestrator enforces this and marks assessments `partial` if probes are still running at the budget.

## Working with the edge prober fleet

The edge probers are lightweight Next.js Edge Functions deployed to 15 Vercel regions. They live in `/edge/probe/`.

Each prober accepts a URL and returns timing data: DNS time, TCP time, TLS time, TTFB, total transfer. Three probes per region per asset, take the median.

The orchestrator invokes all 15 regions in parallel. Aggregate results in the latency phase.

Edge prober code stays tiny. No external dependencies beyond the Next.js runtime. No database access. No logging beyond Sentry.

## Session start ritual

At the start of every Claude Code session, do these four things.

One. Read PROGRESS.md to learn current state.

Two. Run `git status` and `git log -10` to confirm the working state.

Three. Run `pnpm install` to confirm dependencies match the lockfile.

Four. Run `pnpm db:check` to confirm the local database matches the latest migration.

If any of these surface unexpected state, stop and ask Dan before proceeding.

## Session end ritual

At the end of every Claude Code session, do these four things.

One. Update PROGRESS.md with what was done this session, what's next, decisions made, and open questions.

Two. If any decisions were made, append them to DECISIONS.md in the standard ADR format.

Three. Run the test suite and confirm green.

Four. Commit and push the work in progress with a clear conventional commit message.

The PROGRESS.md update is the single most important habit. Future sessions depend on it.

## When in doubt

When the spec and this file conflict, the spec wins.

When the spec and a request from Dan in the chat conflict, ask Dan to confirm before proceeding.

When unsure whether something is a decision or a coding choice, treat it as a decision and write it down in DECISIONS.md.

Bias toward shipping. The tool's value comes from being in the field's hands, not from being perfect.
