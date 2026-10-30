---
status: Accepted
owner: "ivan lysakov"
reviewers: []
updated_at: "2026-10-29"
feature_size: M
stage: "04-05"
ticket: "none"
---

# 0005 — Deliver domain events through a transactional outbox

- **Status:** Accepted
- **Date:** 2026-10-29
- **Deciders:** ivan lysakov (Architect), during the architecture-design pass

## Context

`src/shared/event-bus.ts` calls handlers in-process with no storage; nothing subscribes yet. On Vercel a function may end right after the response, and a failing `apiary` handler would lose `PaymentSucceeded` for good. ADR 0001 (initial setup) requires a durable path for payment events before going live; AC-17 requires the apiary mark to catch up without a manual step.

## Decision drivers

- Activation delay ≤ 60 s p95; 100% of payment state changes audited (PRD §6).
- 0 payment incidents across the first season (PRD §7).
- Serverless hosting with no long-running process (ADR-0001).

## Considered options

1. **Transactional outbox** — an `OutboxEvent` row written in the same transaction as the state change; a dispatcher delivers it after the response; a scheduled sweep re-delivers anything left; handlers are idempotent.
2. **State reconciliation** — keep the in-process `publish()` and treat the billing tables as the durable record: a scheduled job re-publishes the current state of every active hive rental so the apiary mark converges. This satisfies ADR 0001 (initial setup)'s durability requirement for state-like events, but not for fact-like ones such as `PaymentFailed`.

## Decision outcome

**Chosen:** Option 1. A state change and its event commit together or not at all, so no event is lost, and the mechanism also serves fact-like events (`PaymentFailed` for notifications) that state reconciliation cannot rebuild.

## Consequences

**Positive**
- Closes the event-loss risk from ADR 0001 (initial setup) for every module, not only billing.
- The outbox doubles as a delivery log for debugging.

**Negative**
- A new shared table and dispatcher (~150 lines) in `src/shared/`; `publish()` takes a transaction client.
- At-least-once delivery: every handler must record processed event IDs and ignore repeats.

**Neutral**
- How fast a stuck event is retried depends on the sweep schedule (§7).

## Links

- PRD: [[../PRD.md]] §6, §8
- SAD: [[../sad.md]] §4, §7, §8
- Related ADR: [[0001-host-on-vercel-for-v1]], [[0004-billing-owns-seasons-holds-and-hive-rentals]]
