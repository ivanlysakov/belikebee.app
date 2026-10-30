---
status: Draft
owner: "ivan lysakov"
reviewers: []
updated_at: "2026-10-30"
feature_size: M
---

# Events — hive-rental

Async contract for the outbox deliveries drawn in sad.md §6 (flows 1, 2, 9, 13). Each event is a fact `billing` publishes in the same transaction as the state change (ADR-0005); subscribers react on their own. Every event here maps to an `outbox` message in a §6 diagram.

## Channel: in-process outbox

- **Storage:** `OutboxEvent` (data-model.md); `publish(tx, event)` writes it inside the caller's transaction.
- **Producer:** `billing`.
- **Consumers:** wired in `src/app/event-subscriptions.ts` (`src/shared` cannot import modules).
- **Delivery:** at least once. Dispatch runs after the response (`after()`), on every checkout-hold screen refresh, and in the daily `GET /api/jobs/outbox` sweep.
- **Ordering:** none. Each consumer must handle events in any order (see `rentedSubscriptionId` below).

## Envelope

The repo's `DomainEvent` shape (`src/shared/events/index.ts`), plus the outbox id that handlers record:

```ts
type Delivered<E extends DomainEvent> = E & { id: string };   // id = OutboxEvent.id
// E = { type: "<PascalCaseName>"; payload: { … }; occurredAt: Date }
```

- **Required fields:** `id`, `type`, `payload`, `occurredAt`.
- **Backwards compatibility:** additive only. A new optional payload field is fine; removing or renaming one needs a new event type. Consumers ignore unknown fields.

## Event: `PaymentSucceeded`

A confirmed payment activated a hive rental.

```ts
type PaymentSucceeded = {
  type: "PaymentSucceeded";
  payload: {
    paymentId: string;        // Payment.id
    subscriptionId: string;   // Subscription.id
    hiveId: string;           // Subscription.hiveId
    clientId: string;         // Subscription.clientId
    seasonId: string;         // Subscription.seasonId
    amountKopecks: number;    // Payment.amountKopecks
  };
  occurredAt: Date;
};
```

- **Origin:** flow 1 and flow 9 (`outbox PaymentSucceeded` in the activation transaction); flow 3 (activation through reconciliation).
- **Not published** for a payment without a hive rental (AC-19b): no rental exists.
- **Consumers:** `apiary` sets `Hive.rentedSubscriptionId = subscriptionId` (flows 1, 2, 9). `notifications` per `docs/bc-map.md`, once that module exists; no handler in v1.

## Event: `PaymentFailed`

A payment attempt failed. The checkout hold stays until it expires (AC-18).

```ts
type PaymentFailed = {
  type: "PaymentFailed";
  payload: {
    paymentId: string;        // Payment.id
    holdId: string;           // Payment.holdId
    hiveId: string;           // CheckoutHold.hiveId
    clientId: string;         // CheckoutHold.clientId
  };
  occurredAt: Date;
};
```

- **Origin:** flow 9 (`else failure`) and flow 3 (`else failed or expired`).
- **Consumers:** none in v1. `notifications` per `docs/bc-map.md` later. ADR-0005 keeps it in the outbox so it is not lost before then.

## Event: `SubscriptionEnded`

A hive rental's season ended (ADR-0007). New: add it to `src/shared/events`, `docs/bc-map.md` and `.claude/rules/apiary.md` (sad.md §11).

```ts
type SubscriptionEnded = {
  type: "SubscriptionEnded";
  payload: {
    subscriptionId: string;   // Subscription.id
    hiveId: string;           // Subscription.hiveId
    clientId: string;         // Subscription.clientId
    seasonId: string;         // Subscription.seasonId
  };
  occurredAt: Date;
};
```

- **Origin:** flow 13 (`outbox SubscriptionEnded` when the season-end job sets `ENDED`).
- **Consumers:** `apiary` sets `Hive.rentedSubscriptionId = null` only where it still equals `subscriptionId`, so an end event that arrives after next season's `PaymentSucceeded` changes nothing.

## Not published in v1

- `SubscriptionActivated`: `docs/bc-map.md` has `billing` publish it for `scheduling`, but no sad.md §6 flow publishes it and `scheduling` has no code. Deferral 6 in [api-sync-report.md](./api-sync-report.md).
- `SubscriptionPlanSelected`, `PaymentInvoiceCreated` (bc-map, cited in PRD §1): no flow publishes them and no consumer exists. Not added.

## Idempotency and retry

From flows 2, 9 and 13:

- **Idempotency:** each consumer inserts `ProcessedEvent(consumer, eventId)` in the same transaction as its effect. A unique violation means "already handled": skip and report success.
- **Retry:** no backoff. Every dispatch (after the response, each hold-screen refresh, the daily sweep) retries every pending event and increments `OutboxEvent.attempts` on failure, saving `lastError`.
- **Dead letter:** no separate queue. After 5 failed attempts the event stays pending, an alert-level log entry is written, and the sweep keeps retrying (sad.md §6 "Dead-letter shape").

## Schema registry

- Types: `src/shared/events/index.ts` (TypeScript union `DomainEvent`), the only registry.
- Validation: TypeScript at the publisher; no runtime validation, because events never leave the process.
