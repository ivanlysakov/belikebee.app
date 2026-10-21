# ADR 0001: Initial setup — modular monolith on Next.js, Prisma, and Monobank

- **Status**: Accepted
- **Date**: 2026-10-21

## Context

BeLikeBee.app starts with a small team and an unproven market. The product spans five bounded contexts (Identity, Apiary, Billing, Scheduling, Notifications; see [bc-map.md](../bc-map.md)) that are tightly linked by domain events, such as a payment activating a hive rental. We need to ship the first version fast while keeping those contexts separate enough that the codebase does not turn into a tangle as it grows.

Requirements that drive the choice:

- One team, one deploy pipeline, low operational cost.
- Server-rendered pages and backend logic in one language.
- A relational model with real constraints (users, hives, subscriptions, payments).
- Recurring payments in UAH for Ukrainian clients.

## Decision

1. **Feature-First Modular Monolith.** One application with one module per bounded context under `src/modules/<name>/`. Modules communicate only through their `index.ts` public API or through domain events; shared, business-neutral code lives in `src/shared/`. Rules are in [ARCHITECTURE.md](../../ARCHITECTURE.md).
2. **Next.js (App Router, TypeScript).** UI, server actions, and route handlers (including payment webhooks) in one framework. Routes in `src/app/` stay thin and call module APIs.
3. **PostgreSQL + Prisma ORM.** One database and one Prisma schema; each model is owned by exactly one module. Prisma gives typed queries and versioned migrations.
4. **Monobank API for payments.** Monobank acquiring handles invoices and recurring charges in UAH. The Monobank client lives inside the `billing` module and nowhere else, behind an interface so another gateway (e.g., Stripe) can be added later.
5. **Supporting choices:** Tailwind CSS + shadcn/ui for UI, Zod for validating all external input (forms, webhooks, env), NextAuth v4 for authentication (v5 is still in beta).

Alternatives considered:

- **Microservices**: rejected for now. Network calls, separate deploys, and distributed data cost too much for the current team size.
- **Layer-first monolith** (`components/`, `services/`, `models/`): rejected. Context boundaries blur and every feature change touches many folders.
- **Stripe as the first gateway**: deferred. Monobank fits the primary market (Ukrainian clients, UAH).

## Consequences

Positive:

- Fast start: one repo, one build, one database, one deploy.
- Each bounded context is visible in the folder tree and can later be extracted into a service.
- Type safety from the database (Prisma) to the edge (Zod) to the UI (TypeScript).

Negative / risks:

- Module boundaries are a convention until lint rules enforce them; without enforcement they will erode.
- One shared database makes it tempting to query another module's tables; this must be caught in review.
- An in-process event bus loses events if the process crashes mid-handling. Payment-related events will need a durable approach (e.g., an outbox table) before going live.
- Billing depends on a single regional provider; Monobank outages or API changes directly affect revenue.
- Webhooks must be verified and processed idempotently, since Monobank can deliver the same status more than once. Verification uses Monobank's ECDSA public key (`X-Sign` header), not a shared secret, so it must run on the raw request body before any JSON parsing.
