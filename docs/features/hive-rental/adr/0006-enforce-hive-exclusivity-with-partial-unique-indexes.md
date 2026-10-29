---
status: Accepted
owner: "ivan lysakov"
reviewers: []
updated_at: "2026-10-29"
feature_size: M
stage: "04-05"
ticket: "none"
---

# 0006 — Enforce hive exclusivity with partial unique indexes

- **Status:** Accepted
- **Date:** 2026-10-29
- **Deciders:** ivan lysakov (Architect), during the architecture-design pass

## Context

Two clients can start renting the same hive at the same moment (AC-13), one client can open a second tab (AC-13b), and a late payment can try to activate after its hold lapsed (AC-19b). A client may hold one checkout hold at a time and one hive rental per overlapping season (AC-12).

## Decision drivers

- 0 hives with more than one active rental or checkout hold under 10 concurrent attempts (PRD §6).
- Checkout start → payment page ≤ 2 s p95 (PRD §6).
- Hold squatting limited to one hold per client (PRD §6.1).

## Considered options

1. **Partial unique indexes + per-client advisory lock** — Postgres rejects a second live claim on a hive and a second held hold per client; AC-12's season-overlap check runs under `pg_advisory_xact_lock(clientId)`.
2. **Row lock on the hive** — `SELECT … FOR UPDATE` on a per-hive row, then check and insert in code.
3. **SERIALIZABLE transactions with retry** — Postgres aborts one of two conflicting transactions; code retries with backoff.

## Decision outcome

**Chosen:** Option 1. The guarantee lives in the schema, so every code path that creates a claim (checkout start, late activation) is covered without remembering to lock, and contention stays per hive and per client.

## Consequences

**Positive**
- A double claim is impossible even if a new path forgets a check.
- The concurrency test (10 parallel starts on one hive) checks a database rule, not timing.

**Negative**
- Prisma cannot declare partial indexes; they are hand-written SQL in the migration and must be kept when the schema changes.
- Expired holds must be lapsed (status update) inside the same transaction before the insert, or they would block the index.

**Neutral**
- The unique-violation error is mapped to the "someone else is paying" result (AC-13).

## Links

- PRD: [[../PRD.md]] §5 AC-12, AC-13, AC-13b, AC-19b; §6
- SAD: [[../sad.md]] §4, §10
- Related ADR: [[0004-billing-owns-seasons-holds-and-hive-rentals]]
