---
paths:
  - "src/modules/apiary/**"
---

# Apiary context: boundaries

Full description: `src/modules/apiary/README.md`. These rules apply to every file under `src/modules/apiary/`.

## Owns

- Prisma models for Apiary, Hive, Hive Log, and Work Order.
- Its public API is `src/modules/apiary/index.ts`. Export only what other code needs today.

## Forbidden

- Marking a hive as rented in any way other than reacting to `PaymentSucceeded`, or as no longer rented other than reacting to `SubscriptionSuspended`. Don't check payment or subscription state here; `billing` decides that.
- Storing prices, plans, or honey quotas on a hive. They belong to `billing`.
- Letting anyone but the Beekeeper who owns the apiary post a Hive Log or fulfil a Work Order.
- Notifying the client about a new log entry. Publish `HiveLogEntryCreated` and stop; `notifications` delivers it.
- Making the Hive Log request wait for photo or video uploads to finish. Uploads must not block the request (`SPEC.md` §4, Performance).
