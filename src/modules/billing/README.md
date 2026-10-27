# Billing & Subscription Context

Money: what a client pays for, how much, and whether the payment went through. The only context that talks to Monobank.

## Owns

- **Plan / Tariff**: pricing tiers and service levels (e.g., _Basic_, _Premium + Honey_).
- **Subscription**: a client's paid agreement on a chosen plan and its renewal cycle.
- **Invoice / Payment**: financial transactions created and confirmed through the Monobank API.
- **Honey Quota**: the weight of raw honey, set by the client's plan, guaranteed to the client at season end regardless of the hive's actual harvest.
- **Honey Reservation**: the client's confirmation near season end that they will take their honey quota.
- The Monobank API client and webhook handling: verify the `X-Sign` header (ECDSA signature of the raw request body) with the public key from `GET /api/merchant/pubkey`, and process each status change once, since Monobank retries delivery.

## Publishes

- `SubscriptionPlanSelected`
- `PaymentInvoiceCreated`
- `PaymentSucceeded`
- `PaymentFailed`
- `SubscriptionActivated`
- `SubscriptionSuspended`
- `HoneyHarvestReserved`

## Consumes

- `UserRegistered` (from `identity`): creates the billing customer record.
- `HiveAddedToPlatform` (from `apiary`): makes the hive available for rent.

## Out of scope

- Hive state and logs → `apiary`.
- Authentication and profiles → `identity`.
- Telling the client a payment failed → `notifications`.
