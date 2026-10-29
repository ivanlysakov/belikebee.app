---
status: Accepted
owner: "ivan lysakov"
reviewers: []
updated_at: "2026-10-29"
feature_size: M
stage: "04-05"
ticket: "none"
---

# 0003 — Render the rental UI on the server with client islands

- **Status:** Accepted
- **Date:** 2026-10-29
- **Deciders:** ivan lysakov (Architect), during the architecture-design pass

## Context

Existing pages are React Server Components; forms submit through server actions with `useActionState`, and only about ten files are client components. hive-rental adds one live screen: the checkout hold, with a 15-minute countdown and a payment status that changes from pending to paid or failed without a reload.

## Decision drivers

- p95 ≤ 500 ms for the hive page with plans and the public hive list; ≤ 2 s from a confirmed plan to the payment page (PRD §6).
- WCAG 2.1 AA, 0 serious violations (PRD §6).
- Role checks on every server action and route handler (SPEC §4); match the repo's existing UI conventions.

## Considered options

1. **Server-rendered pages + server actions + client islands** — RSC pages; only the countdown and payment-status block are client components, refreshing the page every few seconds until the status is final.
2. **Client-side checkout over JSON route handlers** — client components fetching new `/api/billing/...` JSON endpoints.

## Decision outcome

**Chosen:** Option 1. It keeps one UI style across the repo, ships little JavaScript (good for p95 and accessibility), and needs no JSON API for the UI; authorization lives in the server actions, as in `apiary`.

## Consequences

**Positive**
- Pages are fast on first load; the hold screen works with JavaScript off except for the live countdown.
- No second contract to secure and keep in sync.

**Negative**
- The payment status updates with a delay of a few seconds (polling by refresh, no push).
- A later mobile app would need a JSON API that does not exist yet.

**Neutral**
- Each refresh of the payment-status island also dispatches pending outbox events and, after about 20 s without a webhook, reconciles the hold's invoice with Monobank (SAD §6 flow 3, §7), so a client waiting on the screen does not depend on the daily cron.
- Screens are composed from the existing `src/shared/ui` primitives and `globals.css` tokens; missing primitives (e.g. badge, card) are added through shadcn, not hand-rolled.

## Links

- PRD: [[../PRD.md]]
- SAD: [[../sad.md]] §4
- Related ADR: [[0002-build-backend-web-and-worker-surfaces]]
