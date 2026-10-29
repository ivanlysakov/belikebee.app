---
status: Accepted
owner: "ivan lysakov"
reviewers: []
updated_at: "2026-10-29"
feature_size: M
stage: "04-05"
ticket: "none"
---

# 0007 — End hive rentals with a SubscriptionEnded event

- **Status:** Accepted
- **Date:** 2026-10-29
- **Deciders:** ivan lysakov (Architect), during the architecture-design pass

## Context

A season subscription has one billing period equal to the season and does not renew (CONTEXT: subscription). After the season ends the hive must lose its "rented" badge and nickname from 00:00 Kyiv time the next day (AC-26). `.claude/rules/apiary.md` lets `apiary` clear its rented mark only on `SubscriptionSuspended`, which means repeated failed payments. PRD §8 asked which signal clears the mark at season end.

## Decision drivers

- AC-26 exact at 00:00 Europe/Kyiv.
- Event names must match the glossary (suspended ≠ ended) so future consumers (notifications, scheduling) react correctly.
- Outbox delivery (ADR-0005).

## Considered options

1. **New `SubscriptionEnded` event** — a daily job marks finished subscriptions `ENDED` and publishes the event; `apiary` clears its mark on it.
2. **Reuse `SubscriptionSuspended`** — same job, existing event, with a reason field in the payload.
3. **Expiry date on the apiary mark** — `PaymentSucceeded` carries `rentedUntil`; the mark stops counting after it; no event and no job.

## Decision outcome

**Chosen:** Option 1. It says what happened in the glossary's words, gives notifications a "season over" signal later, and keeps season logic out of `apiary`. Read-side status is computed from the season end date, so AC-26 does not depend on when the job runs.

## Consequences

**Positive**
- Badge and nickname disappear at 00:00 Kyiv exactly, from billing's read model.
- No overloaded event semantics.

**Negative**
- Amend `.claude/rules/apiary.md`, `docs/bc-map.md`, `src/modules/billing/README.md` and `src/shared/events/` with the new event.
- One more scheduled job.

**Neutral**
- The apiary mark may lag up to a day after season end; nothing displays it.

## Links

- PRD: [[../PRD.md]] §5 AC-26, §8
- SAD: [[../sad.md]] §4, §6
- Related ADR: [[0005-deliver-domain-events-through-transactional-outbox]]
