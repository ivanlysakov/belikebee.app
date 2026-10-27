# BeLikeBee.app: Functional Specification

## 1. Product vision

BeLikeBee.app is a B2B2C remote beekeeping SaaS. City residents rent a real hive at a countryside apiary, follow it through a digital twin, visit it online or in person, and receive a guaranteed quota of raw honey at the end of the season. Beekeepers get a CRM for their apiary and recurring revenue paid up front, before the harvest.

- **B2C**: urban professionals, eco-conscious families, gift buyers.
- **B2B**: independent beekeepers who want to digitize operations and smooth early-season cash flow.

Domain events and context boundaries: see [docs/bc-map.md](docs/bc-map.md).

## 2. User roles

| Role | Who | Can do |
| --- | --- | --- |
| **Client** | Urban resident renting a hive | Browse hives and plans, subscribe and pay, follow the hive feed, order hive tasks, book visits and masterclasses, reserve honey |
| **Beekeeper** | Apiary owner | Manage apiaries and hives, post hive logs, fulfil work orders, publish visit slots, confirm bookings, see subscribers and revenue |
| **Admin** | Platform operator | Onboard and verify beekeepers, manage plans and tariffs, handle payment issues and refunds, moderate content, manage users |

## 3. Key use cases

### UC-1. Hive rental

1. Client browses available hives (apiary, location, photos, plan options).
2. Client selects a plan and a hive → `SubscriptionPlanSelected`.
3. System creates a Monobank invoice and redirects the client to pay → `PaymentInvoiceCreated`.
4. Monobank confirms by webhook → `PaymentSucceeded` → `SubscriptionActivated`; the hive is marked as rented.
5. On failure → `PaymentFailed`; the client is notified and can retry.

### UC-2. Digital twin tracking

1. Beekeeper adds a hive; it gets a QR code and a profile → `HiveAddedToPlatform`.
2. Beekeeper posts hive logs: photos/video, frame count, health checks, treatments, notes → `HiveLogEntryCreated`.
3. Client sees the hive's timeline in their feed and gets a notification for each new entry.
4. Client orders a specific task (a Work Order); the beekeeper fulfils it and logs the result.

### UC-3. Booking visits and masterclasses

1. Beekeeper publishes slots of type `OnlineMasterclass` or `OfflineVisit`.
2. Client requests a slot → `VisitBookingRequested`.
3. Beekeeper confirms → `VisitBookingConfirmed`; both sides get a confirmation.
4. Shortly before the slot, a scheduled job publishes `VisitReminderTriggered`; both sides get a reminder.

### UC-4. Recurring billing via Monobank

1. Subscriptions renew automatically each billing period using Monobank acquiring.
2. Each charge goes through the same invoice → webhook → `PaymentSucceeded` / `PaymentFailed` flow as UC-1.
3. After repeated failures the subscription is suspended → `SubscriptionSuspended`; the client's included bookings are locked and the hive is no longer rented. The client is notified before that happens.
4. Near season end, the client reserves their honey quota → `HoneyHarvestReserved`.

## 4. Non-functional requirements

| Area | Requirement |
| --- | --- |
| **Security** | Secrets only in environment variables. Every Monobank webhook is verified before it is processed. Role checks on every server action and route handler. No card data stored by the platform. |
| **Payment correctness** | Webhook handling is idempotent (the same event delivered twice changes state once). Every payment state change is recorded for audit. |
| **Privacy** | Collect only the personal data the use cases need. Users can export and delete their data. |
| **Performance** | Initial target: p95 page response under 500 ms for core pages; image and video uploads do not block the request. |
| **Availability** | Initial target: 99.5% monthly. A missed webhook can be recovered by re-checking the invoice status. |
| **Localization** | Ukrainian and English UI. Currency UAH. Timestamps stored in UTC, shown in `Europe/Kyiv` by default. |
| **Usability** | Mobile-first: beekeepers post logs from a phone at the apiary. WCAG 2.1 AA for client-facing pages. |
| **Maintainability** | Feature-First modular monolith with enforced module boundaries (see [ARCHITECTURE.md](ARCHITECTURE.md)). All external input validated with Zod. |
| **Observability** | Structured logs with a request ID; alerts on failed payments and webhook errors. |
