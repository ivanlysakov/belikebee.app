---
paths:
  - "src/modules/billing/**"
---

# Billing context: boundaries

Full description: `src/modules/billing/README.md`. These rules apply to every file under `src/modules/billing/`.

## Owns

- Prisma models for Plan, Subscription, Invoice/Payment, and Honey Reserve/Quota.
- The Monobank client. No other module calls Monobank.
- Its public API is `src/modules/billing/index.ts`. Export only what other code needs today.

## Forbidden

- Storing copies of user or hive data. Refer to users and hives by `userId` and `hiveId`; ask `identity` or `apiary` through their `index.ts` when more is needed.
- Calling `apiary`, `notifications`, or `scheduling` after a payment. Publish `PaymentSucceeded` or `PaymentFailed` and stop; consumers react on their own.
- Sending messages to users (payment failed, subscription renewed). That is `notifications`, triggered by the events above.
- Accepting a Monobank webhook without verifying the `X-Sign` header: ECDSA over the raw request body (not re-serialized JSON), with the public key from `GET /api/merchant/pubkey`. There is no shared secret; don't add one.
- Applying the same Monobank status change twice. Monobank retries delivery, so check whether the change was already applied before acting or publishing.
- Floats for money. Monobank amounts are integers in minor units (kopecks); keep them that way end to end.
