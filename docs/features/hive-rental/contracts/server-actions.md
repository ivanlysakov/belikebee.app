---
status: Draft
owner: "ivan lysakov"
reviewers: []
updated_at: "2026-10-30"
feature_size: M
version: 0.1.0
---

# Server actions and read functions — hive-rental

The interface the web UI consumes (ADR-0003: server-rendered pages, server actions, two client islands, no JSON API). Everything here is exported from `src/modules/billing/index.ts`, the only file other code may import (`ARCHITECTURE.md`). Like `openapi.yaml`, it is derived: every function maps to a PRD §4 user story, every field to a `data-model.md` column, and every error to a sad.md §6 `alt` branch or to an entry in [api-sync-report.md](./api-sync-report.md) § Deferrals.

## Conventions

- **Language:** TypeScript, Next.js App Router server actions (`"use server"`), Zod for input.
- **Action shape** (as `src/modules/apiary/add-hive.action.ts`): `(prev: State, formData: FormData) => Promise<State>`, built for `useActionState`. `State` is a union of `{ status: "idle" }`, `{ status: "success", … }` and errors:
  - `{ status: "error"; formError: "<key>" }`: the whole form failed;
  - `{ status: "error"; fieldErrors: Partial<Record<<field>, string[]>> }`: Zod field errors, each value a message key.
- **Error registry:** every `<key>` exists under `errors` in `src/modules/billing/messages/{uk,en}.json`. This contract writes it as `billing.<key>`.
- **Access** (`src/modules/billing/access.ts`, exported): `currentClient()` and `currentAdmin()` return `{ status: "ok"; userId }` or `{ status: "error"; formError: "signInRequired" | "clientsOnly" | "adminsOnly" }`. Beekeeper actions use `apiary.currentBeekeeper()` (`signInRequired | beekeepersOnly | verificationPending`).
- **Existence hiding:** something owned by another beekeeper or client answers exactly like a missing one (AC-08, AC-22, AC-25, AC-28).
- **Money** is integer kopecks in every type; the admin types hryvnias, which `createPlan` converts. **Dates** are `YYYY-MM-DD` strings read in Europe/Kyiv; instants are `Date`.
- Successful actions call `revalidatePath` for the pages that show what changed.

## Types

```ts
// data-model.md → Plan
type Plan = {
  id: string;                      // Plan.id
  name: string;                    // Plan.name, 1–100 chars
  seasonPriceKopecks: number;      // Plan.seasonPriceKopecks, > 0
  honeyQuotaGrams: number;         // Plan.honeyQuotaGrams, >= 0
  archivedAt: Date | null;         // Plan.archivedAt; null = on sale
};

// data-model.md → Season (current or upcoming season of one apiary)
type Season = {
  id: string;                      // Season.id
  apiaryId: string;                // Season.apiaryId
  startDate: string;               // Season.startDate, YYYY-MM-DD
  endDate: string;                 // Season.endDate, YYYY-MM-DD
  hasClaims: boolean;              // derived: a live hold or a hive rental exists (AC-09: dates are fixed)
};

// Rental status of one hive as of now in Kyiv time (flow 7). Holds past expiresAt count as lapsed,
// rentals past their season end as ended (AC-26).
type HiveRentalStatus =
  | { state: "rented"; nickname: string | null }                  // AC-23: no client data
  | { state: "awaitingPayment" }                                  // AC-10, AC-13
  | { state: "noSeason" }                                         // AC-11, AC-26
  | { state: "available"; season: Season; plans: Plan[] };        // AC-10: plans on sale

// The client's own checkout hold (flows 8, 10, 3). Built from CheckoutHold + its latest Payment.
type HoldStatus =
  | {
      state: "awaitingPayment";
      holdId: string;                                             // CheckoutHold.id
      hiveId: string;                                             // CheckoutHold.hiveId
      planName: string;                                           // Plan.name via CheckoutHold.planId
      seasonPriceKopecks: number;                                 // CheckoutHold.seasonPriceKopecks (snapshot)
      honeyQuotaGrams: number;                                    // CheckoutHold.honeyQuotaGrams (snapshot)
      expiresAt: Date;                                            // CheckoutHold.expiresAt
      payment: "notStarted" | "pending" | "failed";               // latest Payment.status, or none
      paymentPageUrl: string | null;                              // latest PENDING Payment.paymentPageUrl
    }
  | { state: "active"; subscriptionId: string }                   // AC-15, then offer a nickname (AC-20)
  | { state: "paidWithoutRental" }                                // AC-19b
  | { state: "expired" };                                         // AC-19

// The client's hive rental (client area, AC-15, AC-20, AC-26, AC-27).
type ClientRental = {
  subscriptionId: string;          // Subscription.id
  hiveId: string;                  // Subscription.hiveId (the page adds hive data from apiary)
  planName: string;                // Plan.name via the hold
  honeyQuotaGrams: number;         // CheckoutHold.honeyQuotaGrams (snapshot)
  season: { startDate: string; endDate: string };   // Season dates
  nickname: string | null;         // Subscription.nickname
  nicknameCleared: boolean;        // Subscription.nicknameClearedAt !== null (AC-27 notice)
  ended: boolean;                  // status ENDED, or past season end at read time (AC-26)
};

// One apiary season in the beekeeper area (AC-24).
type ApiarySeasonSummary = {
  apiaryId: string;                // Season.apiaryId
  season: Season;
  rentals: {
    hiveId: string;                // Subscription.hiveId
    planName: string;              // Plan.name via the hold
    nickname: string | null;       // Subscription.nickname
    clientId: string;              // Subscription.clientId; the page resolves the display name via identity
  }[];
  revenueKopecks: number;          // sum of Payment.amountKopecks linked to a Subscription in this season
};

// Admin list (AC-19b).
type PaymentWithoutRental = {
  paymentId: string;               // Payment.id
  invoiceId: string;               // Payment.invoiceId
  amountKopecks: number;           // Payment.amountKopecks
  clientId: string;                // CheckoutHold.clientId
  hiveId: string;                  // CheckoutHold.hiveId
  paidAt: Date;                    // PaymentAuditEntry.createdAt of the transition to PAID
};
```

## Actions

### `createPlanAction(prev, formData) → CreatePlanState`

Origin: US-01, AC-01, AC-02, AC-03 · flow 4. Access: `currentAdmin()`.

| Field | Type | Rule | Origin |
|---|---|---|---|
| `name` | string | trimmed, 1–100 chars | Plan.name `VARCHAR(100)`, AC-02 |
| `seasonPriceUah` | string | `^\d+(\.\d{1,2})?$`, above 0; stored ×100 as kopecks | AC-01 (hryvnias), Plan.seasonPriceKopecks |
| `honeyQuotaGrams` | string | integer, 0 or more | Plan.honeyQuotaGrams, AC-02 |

```ts
type CreatePlanState =
  | { status: "idle" }
  | { status: "success"; planId: string }
  | { status: "error"; formError: "signInRequired" | "adminsOnly" }
  | { status: "error"; fieldErrors: Partial<Record<"name" | "seasonPriceUah" | "honeyQuotaGrams", string[]>> };
```

There is no update action: plan terms are fixed once created (AC-04).

### `archivePlanAction(prev, formData) → ArchivePlanState`

Origin: US-01, AC-03, AC-05 · flow 5. Access: `currentAdmin()`. Input: `planId`. Archiving an archived plan succeeds without a change.

```ts
type ArchivePlanState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; formError: "signInRequired" | "adminsOnly" | "planNotFound" };
```

### `setSeasonAction(prev, formData) → SetSeasonState`

Origin: US-02, AC-06, AC-06b, AC-07, AC-08, AC-09 · flow 6. Access: `apiary.currentBeekeeper()`; ownership through `apiary/index.ts`. Creates the apiary's current or upcoming season, or changes its dates if it has no live hold and no hive rental.

| Field | Type | Rule | Origin |
|---|---|---|---|
| `apiaryId` | string | an apiary the beekeeper owns | Season.apiaryId, AC-08 |
| `startDate` | string | `YYYY-MM-DD` | Season.startDate |
| `endDate` | string | `YYYY-MM-DD`, after `startDate`, not before today in Kyiv | Season.endDate, AC-07 |

```ts
type SetSeasonState =
  | { status: "idle" }
  | { status: "success"; seasonId: string }
  | { status: "error"; formError: "signInRequired" | "beekeepersOnly" | "verificationPending" | "apiaryNotFound" | "seasonDatesFixed" }
  | { status: "error"; fieldErrors: Partial<Record<"startDate" | "endDate", string[]>> };   // "seasonDatesInvalid"
```

### `startCheckoutAction(prev, formData) → StartCheckoutState`

Origin: US-03, AC-05, AC-10, AC-11, AC-12, AC-13, AC-13b, AC-14 · flows 1, 8. Access: `currentClient()`. One transaction under the locks in `data-model.md` § Concurrency notes, then a Monobank invoice for the snapshot amount with a lifetime equal to the hold's time left. Input: `hiveId`, `planId`. The amount never comes from the form (PRD §6.1).

```ts
type StartCheckoutState =
  | { status: "idle" }
  // New hold, or the client's own live hold on this hive (AC-13b). paymentPageUrl is null when
  // Monobank was unavailable: the hold stays and the hold screen offers retryPaymentAction (flow 8).
  | { status: "success"; holdId: string; paymentPageUrl: string | null }
  | {
      status: "error";
      formError:
        | "signInRequired"        // AC-14: ask to sign in or register as a client
        | "clientsOnly"           // AC-14: beekeeper or admin
        | "hiveNotFound"          // deferral 1: hive does not exist
        | "planNotOffered"        // AC-05, AC-11: plan archived or unknown, or no current or upcoming season
        | "oneHiveAtATime"        // AC-12: another live hold, or a rental in an overlapping season
        | "hiveBeingPaid";        // AC-13: unique live-claim violation
    };
```

### `retryPaymentAction(prev, formData) → RetryPaymentState`

Origin: US-05, AC-18, AC-19 · flow 10. Access: `currentClient()`. Input: `holdId`. Creates a new invoice and a new `Payment` for the same hold; `expiresAt` does not move.

```ts
type RetryPaymentState =
  | { status: "idle" }
  | { status: "success"; paymentPageUrl: string }
  | {
      status: "error";
      formError:
        | "signInRequired"
        | "holdNotFound"          // deferral 2: unknown hold, or another client's
        | "holdExpired"           // AC-19: past expiresAt, or no longer HELD
        | "paymentUnavailable";   // deferral 3: Monobank error; the hold keeps running
    };
```

### `setNicknameAction(prev, formData) → SetNicknameState`

Origin: US-06, AC-20, AC-21, AC-22 · flow 11. Access: `currentClient()`; any other role gets `rentalNotFound`. Saving clears the moderation notice (`nicknameClearedAt = null`).

| Field | Type | Rule | Origin |
|---|---|---|---|
| `subscriptionId` | string | an active hive rental of this client | Subscription.id, AC-22 |
| `nickname` | string | trimmed, 1–40 chars, stored and shown as plain text | Subscription.nickname `VARCHAR(40)`, AC-21 |

```ts
type SetNicknameState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; formError: "signInRequired" | "rentalNotFound" }
  | { status: "error"; fieldErrors: Partial<Record<"nickname", string[]>> };   // "nicknameInvalid"
```

### `clearNicknameAction(prev, formData) → ClearNicknameState`

Origin: US-10, AC-27, AC-28 · flow 14. Access: an admin, or the verified beekeeper who owns the hive (checked through `apiary/index.ts`). Input: `hiveId`. Clears the nickname of the hive's active hive rental and sets `nicknameClearedAt`.

```ts
type ClearNicknameState =
  | { status: "idle" }
  | { status: "success" }
  // A client, a beekeeper who does not own the hive, or no nickname to clear: all answer the same.
  | { status: "error"; formError: "signInRequired" | "nicknameNotFound" };
```

## Read functions

Called from server components. Pages check access first (`currentClient`, `currentAdmin`, `apiary.currentBeekeeper`) and pass the user id in; these functions do not read the session.

| Function | Returns | Origin |
|---|---|---|
| `getHiveRentalStatuses(hiveIds: string[])` | `Record<string, HiveRentalStatus>` | US-03, US-07, US-09 · AC-10, AC-11, AC-23, AC-26 · flow 7. Public |
| `getHoldStatus(clientId: string, holdId: string)` | `HoldStatus \| null` (null = not this client's hold) | US-04, US-05 · AC-15, AC-18, AC-19, AC-19b · flows 3, 10. Side effects, by design (sad.md §4): dispatches pending outbox events, and reconciles the hold's invoice with Monobank when no webhook arrived about 20 s after the payment started |
| `getClientRentals(clientId: string)` | `ClientRental[]`, current and ended | US-04, US-06, US-09 · AC-15, AC-20, AC-26, AC-27 |
| `getApiarySeason(apiaryId: string)` | `Season \| null` | US-02 · AC-06, AC-06b, AC-09. Caller has checked ownership |
| `getBeekeeperSeasons(apiaryIds: string[])` | `ApiarySeasonSummary[]`, current or upcoming seasons only | US-08 · AC-24, AC-25 · flow 12. Caller passes only the beekeeper's own apiary ids |
| `listPlansOnSale()` | `Plan[]` | US-01, US-03 · AC-01, AC-05, AC-10 |
| `listPlans()` | `Plan[]`, on sale and archived | US-01 · AC-01, AC-04. Admin pages only |
| `listPaymentsWithoutRental()` | `PaymentWithoutRental[]` | AC-19b. Admin pages only |

## Entry points for route handlers and jobs

Thin route files in `src/app/api/` call these; their HTTP contract is in [openapi.yaml](./openapi.yaml).

| Function | Called by | Origin |
|---|---|---|
| `handleMonobankWebhook(request: Request): Promise<Response>` | `POST /api/billing/monobank/webhook` | flows 1, 9 |
| `reconcilePayments(): Promise<void>` | `GET /api/jobs/reconcile-payments` | flow 3 |
| `endFinishedSeasons(): Promise<{ endedCount: number }>` | `GET /api/jobs/season-end` | flow 13 |

`dispatchPending()` for `GET /api/jobs/outbox` lives in `src/shared/event-bus.ts`, not in billing (ADR-0005).

## Error keys

All live in `src/modules/billing/messages/{uk,en}.json` under `errors`, except the `apiary` keys, which already exist there.

| Key | Used by | Origin |
|---|---|---|
| `billing.signInRequired` | every action | AC-14; repo access convention |
| `billing.adminsOnly` | createPlan, archivePlan | AC-03 · flows 4, 5 |
| `billing.clientsOnly` | startCheckout | AC-14 · flow 8 |
| `billing.nameRequired`, `billing.nameTooLong` | createPlan `fieldErrors.name` | AC-02 · flow 4; Plan.name `VARCHAR(100)` |
| `billing.priceNotPositive` | createPlan `fieldErrors.seasonPriceUah` | AC-02 · flow 4 |
| `billing.quotaNegative` | createPlan `fieldErrors.honeyQuotaGrams` | AC-02 · flow 4 |
| `billing.planNotFound` | archivePlan | Deferral 4 |
| `billing.seasonDatesInvalid` | setSeason `fieldErrors` | AC-07 · flow 6 |
| `billing.seasonDatesFixed` | setSeason | AC-09 · flow 6 |
| `apiary.apiaryNotFound`, `apiary.beekeepersOnly`, `apiary.verificationPending` | setSeason | AC-08 · flow 6; existing keys |
| `billing.hiveNotFound` | startCheckout | Deferral 1 |
| `billing.planNotOffered` | startCheckout | AC-05, AC-11 · flow 8 |
| `billing.oneHiveAtATime` | startCheckout | AC-12 · flow 8 |
| `billing.hiveBeingPaid` | startCheckout | AC-13 · flows 1, 8 |
| `billing.holdNotFound` | retryPayment | Deferral 2 |
| `billing.holdExpired` | retryPayment | AC-19 · flow 10 |
| `billing.paymentUnavailable` | retryPayment | Deferral 3 |
| `billing.rentalNotFound` | setNickname | AC-22 · flow 11 |
| `billing.nicknameInvalid` | setNickname `fieldErrors.nickname` | AC-21 · flow 11 |
| `billing.nicknameNotFound` | clearNickname | AC-28 · flow 14 |

## Example

```ts
// placeholder data only
const state = await startCheckoutAction({ status: "idle" }, toFormData({ hiveId: "<hive-id>", planId: "<plan-id>" }));
// → { status: "success", holdId: "<hold-id>", paymentPageUrl: "https://pay.example.test/<invoice>" }
// or { status: "error", formError: "hiveBeingPaid" }
```

## Compatibility

This is an internal contract inside one deploy, so the version moves with the code. Removing or renaming an exported function, a `State` variant or an error key is a breaking change: update the UI and this file in the same commit and re-run `/sdlc:api-forge hive-rental --reconcile`.
