---
paths:
  - "src/modules/identity/**"
---

# Identity context: boundaries

Full description: `src/modules/identity/README.md`. These rules apply to every file under `src/modules/identity/`.

## Owns

- Prisma models for User, Role, and Profile, and any tables NextAuth needs.
- Authentication: sign-up, sign-in, sessions (NextAuth).
- Its public API is `src/modules/identity/index.ts`. Export only what other code needs today.

## Forbidden

- Importing any other module, even through its `index.ts`, or subscribing to any event. This context is upstream of all others; if it seems to need their data, raise it instead of adding the dependency.
- Storing subscriptions, payment methods, or card data. Payments belong to `billing`, and the platform stores no card data at all (`SPEC.md` §4, Security).
- Sending messages to users. This module stores contact info and notification preferences; `notifications` delivers.
- Adding a personal data field the use cases don't need. Every field that is added must be covered by the user's data export and deletion (`SPEC.md` §4, Privacy).
- Adding or renaming a role (`Client`, `Beekeeper`, `Admin`) without updating `SPEC.md` §2 and `docs/bc-map.md` in the same change.
