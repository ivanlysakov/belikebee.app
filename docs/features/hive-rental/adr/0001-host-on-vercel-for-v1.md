---
status: Accepted
owner: "ivan lysakov"
reviewers: []
updated_at: "2026-10-28"
feature_size: M
stage: "04-05"
ticket: "none"
---

# 0001 — Host on Vercel for v1

- **Status:** Accepted
- **Date:** 2026-10-28
- **Deciders:** ivan lysakov (Architect), during the architecture-design pass

## Context

The repository has no deployment config (no `vercel.json`, no Dockerfile); only `@vercel/blob` for hive and apiary photos hints at Vercel. hive-rental is the first feature that needs background work: delivering stuck domain events (AC-17), re-checking a Monobank invoice when a webhook is missed (SPEC §4), and announcing season end to the apiary (AC-26). Where the app runs decides what can trigger that work and how Prisma connects to Postgres.

## Decision drivers

- Activation delay ≤ 60 s p95 from confirmation to an active, visible hive rental (PRD §6).
- Availability 99.5% monthly (PRD §6, SPEC §4).
- One developer, low operational cost (ADR 0001 initial setup).
- Photo storage already on Vercel Blob.

## Considered options

1. **Vercel** — serverless Next.js, scheduled work through Vercel Cron calling a protected route handler.
2. **Cloudflare Workers via OpenNext** — Next.js on Workers, Cron Triggers for scheduled work, Postgres through a driver adapter (e.g. Hyperdrive); photo storage would move to R2 or stay external.
3. **Long-running Node server** (`next start` in a container on a VM or Railway) — an in-process scheduler of any frequency, at the cost of running a server.

## Decision outcome

**Chosen:** Option 1, Vercel, for now. It needs no new infrastructure and keeps the existing Blob storage. The author is still considering Cloudflare, so the background-job entry points are plain route handlers that any scheduler can call, and no code depends on a Vercel-only runtime API beyond the cron config.

## Consequences

**Positive**
- No servers to run; one deploy for UI, server actions, webhooks and jobs.
- Photo uploads keep working unchanged.

**Negative**
- Code run after a response has no delivery guarantee, so payment events must be stored in the database before they are acted on (see ADR-0004).
- The cron frequency depends on the Vercel plan; a once-a-day schedule cannot meet the 60 s catch-up target on its own (see §7).

**Neutral**
- Moving to Cloudflare later means swapping the cron config, the Prisma driver adapter and the photo storage, while module code stays as it is. Estimated at several days, which is why this is an ADR.

## Links

- PRD: [[../PRD.md]]
- SAD: [[../sad.md]] §2, §7
- Related ADR: project [ADR 0001 initial setup](../../../adr/0001-initial-setup.md)
