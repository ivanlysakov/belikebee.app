---
status: Accepted
owner: "ivan lysakov"
reviewers: []
updated_at: "2026-10-29"
feature_size: M
stage: "04-05"
ticket: "none"
---

# 0002 — Build backend-service, web-frontend and worker surfaces

- **Status:** Accepted
- **Date:** 2026-10-29
- **Deciders:** ivan lysakov (Architect), during the architecture-design pass

## Context

hive-rental serves four browser roles (client, beekeeper, admin, visitor) and has work that no user triggers: re-delivering stuck domain events (AC-17), reconciling Monobank invoices when a webhook is missed (SPEC §4), and ending hive rentals at season end (AC-26). The surface set decides which §5 containers exist and which contracts, task layers and test tiers the later stages generate.

## Decision drivers

- Activation reliability: confirmation → active, visible hive rental ≤ 60 s p95 (PRD §6).
- Accessibility: WCAG 2.1 AA on hive page, checkout, client area and beekeeper area (PRD §6).
- One deploy on Vercel (ADR-0001).

## Considered options

1. **backend-service + web-frontend + worker** — scheduled jobs are a separate surface with their own event contract.
2. **backend-service + web-frontend** — scheduled jobs folded into the backend surface.

## Decision outcome

**Chosen:** Option 1. The jobs have a different lifecycle (triggered by a scheduler, no user, no request/response) and carry the reliability goal, so making them a surface puts their event contract (`contracts/events.md`) and clock-moved tests on the plan instead of hiding them in backend tasks.

## Consequences

**Positive**
- api-forge writes the webhook and server-action contract plus an events contract; plan-tests adds UI tiers and worker tests with a moved clock.
- §5 shows the scheduled jobs as their own container.

**Negative**
- Three surfaces mean more tasks and test rows than a single-surface M feature.

**Neutral**
- All three surfaces ship in one Next.js deploy; the worker is route handlers, not a separate process.

## Links

- PRD: [[../PRD.md]]
- SAD: [[../sad.md]] §4, §5
- Related ADR: [[0001-host-on-vercel-for-v1]], [[0003-render-rental-ui-on-server-with-client-islands]]
