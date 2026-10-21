# Shared

Code with no business meaning, used by every module: the UI kit (shadcn/ui), the Prisma client, the in-process event bus, env parsing, and small utils.

## Rules

- Imports nothing from `src/modules/` or `src/app/`.
- Holds no business rules. If code mentions a hive, a subscription, or a booking, it belongs in a module.
- `events/` holds domain event names and payload types: the contract between modules. Publishers and consumers both import from here, never from each other.
