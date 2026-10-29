---
status: Accepted
owner: "ivan lysakov"
reviewers: []
updated_at: "2026-10-29"
feature_size: M
stage: "04-05"
ticket: "none"
---

# 0004 — Billing owns seasons, checkout holds and hive rentals

- **Status:** Accepted
- **Date:** 2026-10-29
- **Deciders:** ivan lysakov (Architect), during the architecture-design pass

## Context

A beekeeper sets season dates per apiary, and AC-09 forbids changing them while the season has a checkout hold or hive rental. `.claude/rules/apiary.md` forbids `apiary` from checking payment or subscription state and lets it mark a hive rented only by reacting to events. PRD §8 left open which context owns season dates and shows a hive's hold or rented state, and how the apiary's mark catches up after a failed update (AC-17).

## Decision drivers

- Exclusivity: 0 hives with more than one active rental or checkout hold under 10 concurrent attempts (PRD §6).
- AC-17: a paid hive rental stays active and the hive shows rented even if the apiary update fails.
- Module rules: one owner per table, no cross-module state checks (`ARCHITECTURE.md`, `.claude/rules/*.md`).

## Considered options

1. **`billing` owns everything** — Plan, Season (by `apiaryId`), CheckoutHold, Subscription (the hive rental, with its hive nickname), Payment and the audit log; `apiary` keeps only an event-driven rented mark.
2. **New `rental` module** — Season, CheckoutHold, HiveRental and nickname in a sixth module; `billing` keeps Plan, Payment and Monobank and publishes `PaymentSucceeded` for `rental` to activate.
3. **`apiary` owns seasons, `billing` the rest** — Season next to Apiary; `billing` reads dates through `apiary/index.ts`.

## Decision outcome

**Chosen:** Option 1. Season dates, holds and rentals are checked together in one transaction (AC-09, AC-12, AC-13), which only works if one module owns all of them. It matches the PRD default and the bc-map (subscriptions belong to billing), and keeps five modules.

## Consequences

**Positive**
- Season-date locking, hold exclusivity and activation are single-module transactions.
- Public pages read rental status from `billing`, so the badge is right even when the apiary mark lags (AC-17).

**Negative**
- `billing` grows large; season, which the glossary ties to the apiary, is stored in the money module.
- `billing` must ask `apiary` (through `index.ts`) whether a beekeeper owns an apiary and whether a hive exists.

**Neutral**
- Extracting a `rental` module later means moving tables and re-pointing events: days of work, but no change for `apiary`.

## Links

- PRD: [[../PRD.md]] §8
- SAD: [[../sad.md]] §4, §5
- Related ADR: [[0005-deliver-domain-events-through-transactional-outbox]], [[0006-enforce-hive-exclusivity-with-partial-unique-indexes]]
