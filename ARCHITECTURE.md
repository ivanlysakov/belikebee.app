# Architecture

## Pattern: Feature-First Modular Monolith

The code is one Next.js application, deployed as one unit, split inside into modules. Each module matches one bounded context from [docs/bc-map.md](docs/bc-map.md).

Why this shape:

- **One deployable**: a small team gets one build, one database, one deploy. No network calls between services, no distributed transactions.
- **Feature-first, not layer-first**: everything about billing (UI pieces, server actions, Prisma queries, Zod schemas) lives in `src/modules/billing/`, not spread across `components/`, `services/`, `models/`. A change to one feature touches one folder.
- **Clear exit path**: because modules only talk through public APIs and events, a module can later be moved into its own service without rewriting its callers.

## Directory layout

```text
src/
├── app/                  # Next.js App Router: routes, layouts, route handlers. Thin: calls module public APIs.
├── modules/
│   ├── identity/         # Users, roles, profiles, auth
│   ├── apiary/           # Apiaries, hives (digital twin), hive logs, work orders
│   ├── billing/          # Plans, subscriptions, invoices, Monobank client, honey quotas
│   ├── scheduling/       # Visit slots, bookings
│   └── notifications/    # Push and Telegram delivery
│       └── <name>/index.ts   # The module's public API: the only file other code may import
└── shared/               # Code with no business meaning: UI kit (shadcn/ui), db client, event bus, utils
    └── events/           # Domain event names and payload types (the contract between modules)
```

Each module's `README.md` states what it owns, which events it publishes and consumes, and what is out of scope.

## Dependency rules

Dependencies point one way:

```text
src/app  →  src/modules/<name>/index.ts  →  src/shared
```

1. **`src/app/`** may import any module, but only through `src/modules/<name>/index.ts`.
2. **A module** may import its own files, `src/shared/`, and other modules' `index.ts`. It must never import another module's internal files.
   - Allowed: `import { getActiveSubscription } from "@/modules/billing"`
   - Forbidden: `import { prisma } from "@/modules/billing/db/queries"`
3. **`src/shared/`** imports nothing from `src/modules/` or `src/app/`.
4. **No import cycles between modules.** If two modules need each other, the downstream one reacts to a domain event instead of calling the upstream one.
5. **Events as the default integration.** When something happens in one context that others care about (`PaymentSucceeded`, `HiveLogEntryCreated`), the owner publishes an event; consumers subscribe. Event types live in `src/shared/events/`, so publishers and consumers never import each other.
6. **Data ownership.** All models share one Prisma schema and one database, but each table belongs to exactly one module. Only that module reads or writes it; other modules ask through its public API.

Example: when a payment succeeds, `billing` does not call `apiary` and `notifications`. It publishes `PaymentSucceeded`; `apiary` marks the hive as rented and `notifications` messages the client. `billing` does not know either of them exists.

These rules will be enforced by lint (import restrictions) once the toolchain is set up. Decision record: [docs/adr/0001-initial-setup.md](docs/adr/0001-initial-setup.md).
