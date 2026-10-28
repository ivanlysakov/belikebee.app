---
status: Draft
owner: "ivan lysakov"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-10-28"
feature_size: "M"
stage: "03"
ticket: "none"
---

# PRD — hive-rental

> **Inputs (required):** [idea-brief](./idea-brief.md) · [CONTEXT](../../CONTEXT.md) (repo-wide glossary; there is no feature-level CONTEXT.md, by the author's decision)
> **Reference module:** `src/modules/apiary`. Patterns used: only a signed-in, admin-verified beekeeper manages an apiary; another beekeeper's apiary answers exactly like a missing one; names are limited to 100 characters; a hive is marked rented only by reacting to a billing event.
> **External context channels used:** Project docs: `SPEC.md` (UC-1, §2 roles, §4 NFRs), `docs/bc-map.md` (domain events), `.claude/rules/apiary.md` (rented-state rule). architecture-map: none.

## 1. Context

City residents want a real link to nature and traceable honey but have no space, time or skills to keep bees. Independent, admin-verified beekeepers carry their highest costs in spring, before any honey is sold, and have few sales channels. BeLikeBee already lists hives publicly, but a client cannot rent or pay for one, so neither side gets value yet (idea-brief §2, §3).

Hive rental is the core flow every later feature depends on (hive feed, visits, honey reservation), and the parts it builds on are done: accounts, verified beekeepers, apiaries, hives with photos, public hive pages. The timing comes from the capstone deadline, not a market event (idea-brief §4).

The committed approach is idea-brief §13 **Approach C, Name Your Hive**, shipped without its gift option and rental certificate: a checkout as short as one season plan with one up-front payment, plus one emotional moment, where the client gives the rented hive a nickname. In practice v1 is Approach A plus naming, so the "gift channel" argument behind C does not apply to v1; gifting is deferred, not abandoned (§8). Rented hives stay listed with a "rented" badge. The payment path is unproven (idea-brief §12, Tech ☐), so the first build step is getting one test payment through.

Traceability:

- SPEC UC-1 gives the flow; SPEC §4 gives payment idempotency, an audit record for every payment state change, p95 under 500 ms for core pages, 99.5% monthly availability, and WCAG 2.1 AA. The bc-map events in play are `SubscriptionPlanSelected`, `PaymentInvoiceCreated`, `PaymentSucceeded`, `PaymentFailed` and `SubscriptionActivated`.
- `.claude/rules/apiary.md` lets the apiary mark a hive rented only on `PaymentSucceeded` and unmark it only on `SubscriptionSuspended`. Ending a rental at season end needs a new signal (§8).
- Interview decisions (2026-10-28): the platform collects every payment and pays beekeepers by hand outside the product; a subscription has one billing period equal to the season and does not renew; each beekeeper sets season dates for their apiary; the admin manages plans in the product; the beekeeper sees new rentals in their own area, with no push or Telegram message; the hive nickname is public, the client's personal data never is; "tariff" is a synonym of "plan".
- Decision override: scope beyond idea-brief §13's locked-in list (US-01 plans, US-02 season dates, US-09 season end, US-10 nickname moderation) — overridden by author, rationale: these come from interview decisions, and without plans, season dates and an end rule the payment slice cannot run. Cut order if time runs short: US-10 first, then US-01 (plans created by a script instead).
- Interview decision: **the gift option and the rental certificate are cut from v1.** idea-brief §13 kept them in scope as "the first things cut if time runs short"; the author cut them now to keep checkout minimal.

## 2. Goals

- A client can rent one specific hive for a season and pay for it online, end to end, without a manual step by the beekeeper or the admin.
- A beekeeper sees, before the season starts, which of their hives are rented and how much confirmed money the rentals brought in.
- Renting feels personal and visible: the client names the hive, and the public hive list shows which hives are already rented.

## 3. Non-goals

- Automatic renewal: v1 takes one payment per season, and the subscription ends with the season (idea-brief §5).
- Honey reservation and delivery: the plan shows the honey quota, but claiming it is a later feature (idea-brief §5).
- Refunds and mid-season hive swaps: when a colony dies or a beekeeper drops out, the admin handles it outside the product (idea-brief §5; interview decision).
- Shared hives: a hive rental is exclusive, one client per hive per season (idea-brief §5).
- Real money: payments run in the payment provider's test mode only (idea-brief §5).
- Gifts and rental certificates: cut in the PRD interview to keep checkout minimal (idea-brief §13 named them the first cut); a possible follow-up slice is tracked in §8.
- Cancelling a hive rental: in v1 neither the client nor the admin cancels a paid hive rental in the product, because there are no refunds; it ends at season end (closes idea-brief §15 on cancellation).
- Push or Telegram notices: beekeepers see new rentals in their own area; message delivery belongs to a later notifications feature.

## 4. User stories

### US-01: Create and archive plans

**As an** admin
**I want** to create season plans (name, season price, honey quota) and archive plans that are no longer sold
**So that** clients choose from a curated catalogue with clear prices

### US-02: Set apiary season dates

**As a** beekeeper
**I want** to set the start and end dates of the season for my apiary
**So that** my hives can be rented for exactly that season

### US-03: Choose a plan for a hive

**As a** client
**I want** to pick a plan on an available hive's page and start paying
**So that** the hive is held for me while I pay

### US-04: Pay for a hive rental

**As a** client
**I want** to pay once for the season
**So that** I hold the hive rental for the whole season and nobody else can rent that hive

### US-05: Retry a failed payment

**As a** client
**I want** to see that my payment failed and try again
**So that** a bank hiccup doesn't cost me the hive

### US-06: Name my rented hive

**As a** client
**I want** to give my rented hive a nickname
**So that** this hive rental feels personal and others can see it

### US-07: See which hives are rented

**As a** visitor
**I want** to see rented hives in the public list with a "rented" badge and their nickname
**So that** I can tell that real people rent hives here

### US-08: Track rentals and season revenue

**As a** beekeeper
**I want** to see my rented hives and my season revenue
**So that** I know how much pre-season money is confirmed

### US-09: Free hives after season end

**As a** beekeeper
**I want** my hives to become available again once the season ends
**So that** I can rent them for the next season

### US-10: Clear an offensive nickname

**As an** admin
**I want** to clear an offensive hive nickname
**So that** public pages stay clean

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** an admin is signed in
**When** the admin creates a plan with a name, a season price and a honey quota
**Then** the plan appears in the catalogue that clients choose from, and in the admin's list of plans on sale

### AC-02 (US-01) — error

**Given** an admin is creating a plan
**When** the admin leaves the name empty, enters a season price that is not above zero, or enters a honey quota below zero
**Then** the system does not create the plan and shows the admin which field is wrong and what it must be

### AC-03 (US-01) — authorization

**Given** a beekeeper or a client is signed in
**When** they try to create or archive a plan
**Then** the system refuses and tells them that only an admin manages plans

### AC-04 (US-01) — domain invariant

**Given** a plan that at least one client has already paid for
**When** the admin tries to change its season price or honey quota
**Then** the system blocks the change and tells the admin that a plan already sold cannot change its terms, and that they can archive it and create a new one

### AC-05 (US-01) — happy path

**Given** a plan on sale that some clients already rent with
**When** the admin archives the plan
**Then** new clients no longer see it on any hive page, and clients who already paid keep the season price and honey quota they paid for

### AC-06 (US-02) — happy path

**Given** a verified beekeeper owns an apiary with no current or upcoming season
**When** the beekeeper sets a season start date and end date for the apiary
**Then** the apiary shows those season dates and its hives become available for rent for that season

### AC-07 (US-02) — error

**Given** a verified beekeeper is setting season dates for their apiary
**When** the end date is not after the start date, or the end date has already passed
**Then** the system does not save the dates and tells the beekeeper that a season must end after it starts and must end in the future

### AC-08 (US-02) — authorization

**Given** a beekeeper is signed in
**When** they try to set season dates for an apiary they do not own
**Then** the system answers exactly as if the apiary did not exist, so other beekeepers' apiaries cannot be discovered

### AC-09 (US-02) — domain invariant

**Given** an apiary whose season has at least one active hive rental or checkout hold
**When** the beekeeper tries to change that season's dates
**Then** the system blocks the change and tells the beekeeper that the dates of a season with rentals are fixed

### AC-10 (US-03) — happy path

**Given** a client is signed in, and a hive is available in an apiary with a current or upcoming season
**When** the client opens the hive's page, which lists each plan on sale with its season price, honey quota and the season dates, then picks a plan and confirms
**Then** the hive is held for that client for 15 minutes, other people see it as awaiting payment, and the client goes on to pay the plan's season price

### AC-11 (US-03) — cross-context

**Given** a hive whose apiary has no current or upcoming season
**When** a client opens the hive's page
**Then** no plans are offered, and the page says that renting opens once the beekeeper sets the season

### AC-12 (US-03) — domain invariant

**Given** a client already holds a hive rental or a checkout hold in a season
**When** the client tries to start renting another hive whose season overlaps it
**Then** the system blocks it and tells the client that one client can rent one hive per season

### AC-13 (US-03) — domain invariant

**Given** client A holds a checkout hold on a hive
**When** client B tries to start renting the same hive
**Then** client B is told that someone else is paying for this hive and can try again later, and only one client can end up with the hive rental

### AC-14 (US-03) — authorization

**Given** a visitor who is not signed in, or a signed-in beekeeper or admin
**When** they try to rent a hive
**Then** the visitor is asked to sign in or register as a client, and the beekeeper or admin is told that only clients rent hives

### AC-15 (US-04) — happy path

**Given** a client with a checkout hold has paid the plan's season price
**When** the payment provider confirms the payment
**Then** the hive rental becomes active for the apiary's season, and the client sees the hive, plan, honey quota and season dates in their own area

### AC-16 (US-04) — domain invariant

**Given** a confirmed payment has already activated a hive rental
**When** the same payment confirmation arrives a second time
**Then** nothing changes: there is still one hive rental, and the beekeeper's season revenue counts the payment once

### AC-17 (US-04) — cross-context

**Given** a payment for a hive is confirmed
**When** the hive rental activates
**Then** the hive is marked rented in its apiary for that season, and if updating the beekeeper's view fails, the paid hive rental stays active and is not undone

### AC-18 (US-05) — error

**Given** a client has a checkout hold
**When** the payment fails or the client abandons it
**Then** the hold ends, the hive is available to anyone again, and the client sees that the payment did not go through and can start again while the hive is still free

### AC-19 (US-05) — domain invariant

**Given** a checkout hold lapsed after 15 minutes without a confirmed payment
**When** the client tries to finish paying
**Then** no money is taken, and the client is told the hold expired and can start again if the hive is still available

### AC-20 (US-06) — happy path

**Given** a client holds an active hive rental
**When** the client sets a hive nickname
**Then** the nickname shows on the hive's page and in the public hive list next to the "rented" badge, and in the client's own area

### AC-21 (US-06) — error

**Given** a client holds an active hive rental
**When** the client enters a nickname that is empty after trimming spaces, or longer than 40 characters
**Then** the system does not save it and tells the client that a nickname must be 1 to 40 characters

### AC-22 (US-06) — authorization

**Given** a client does not hold the hive rental for a hive
**When** they try to set that hive's nickname
**Then** the system answers as if the hive rental did not exist

### AC-23 (US-07) — happy path

**Given** a hive has an active hive rental with a nickname
**When** a visitor opens the public hive list or the hive's page
**Then** the hive stays listed with a "rented" badge and its nickname, offers no plans, and shows no personal data of the client (no name, email or phone)

### AC-24 (US-08) — happy path

**Given** a verified beekeeper whose hives have active hive rentals
**When** the beekeeper opens their own area
**Then** they see each rented hive with its plan, season dates, nickname and the client's display name, and their season revenue as the sum of confirmed payments for that season, with checkout holds and failed payments not counted

### AC-25 (US-08) — authorization

**Given** a beekeeper is signed in
**When** they try to see the hive rentals or season revenue for another beekeeper's hives
**Then** the system answers as if they did not exist

### AC-26 (US-09) — cross-context

**Given** an active hive rental whose season end date has passed
**When** anyone views the hive on the next day
**Then** the client's area shows the rental as ended, the hive loses its "rented" badge and nickname, and the hive can be rented again once the beekeeper sets the next season

### AC-27 (US-10) — happy path

**Given** a rented hive has a nickname
**When** an admin, or the beekeeper who owns the hive, clears the nickname
**Then** the nickname disappears everywhere, and the client sees that it was cleared and can set a new one

### AC-28 (US-10) — authorization

**Given** a beekeeper who does not own the hive, or a client who does not hold its hive rental
**When** they try to clear the hive's nickname
**Then** the system answers as if the nickname did not exist

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95: hive page with plans, public hive list | ≤ 500 ms | p95 page response from structured request logs, rolling 7 days (SPEC §4) |
| Latency p95: plan confirmed → client on the payment page | ≤ 2 s | request-log timing of checkout start, including the payment provider call |
| Activation delay: payment confirmation received → hive rental active and visible | ≤ 60 s p95 | gap between confirmation receipt and rental activation in the payment audit trail |
| Checkout hold | lasts 15 min; the hive shows as available ≤ 1 min after the hold lapses | integration test with the clock moved past expiry |
| Payment correctness | 0 duplicate rentals and 0 double-counted payments on repeated confirmations; 100% of payment state changes audited | integration test replaying one confirmation twice; audit records vs payment state changes |
| Exclusivity | 0 hives with more than one active rental or checkout hold, under 10 concurrent attempts | concurrency integration test: 10 parallel checkout starts on one hive |
| Availability | 99.5% monthly | hosting uptime monitor (SPEC §4) |
| Accessibility | WCAG 2.1 AA, 0 serious violations on the hive page, checkout, client area and beekeeper area | automated accessibility audit in the end-to-end suite |

## 6.1 Security / privacy

- **Data classification:** confidential. A hive rental links a named person to a payment and a place.
- **Personal data touched:** the hive rental links a client account to a hive and a season (internal); the hive nickname is public free text of up to 40 characters, chosen by the client; the client's display name is shown to the beekeeper who owns the rented hive; payment amount and status are confidential. No card data is stored (SPEC §4).
- **AuthZ/AuthN impact:** new capabilities: only an admin creates and archives plans; only a verified beekeeper sets season dates, and only for their own apiary; a beekeeper sees hive rentals and season revenue for their own hives only; only a client starts a checkout, and a client sees and names only their own hive rental; an admin or the owning beekeeper clears a nickname. A payment confirmation is accepted only after the payment provider's signature on it is verified.
- **Abuse cases:**
  - Forged payment confirmation: ignored, no rental activates, and the attempt is logged and alerted (SPEC §4 Observability).
  - Cross-tenant access: a beekeeper probing another beekeeper's apiary, rentals or season revenue gets the same answer as for something that does not exist.
  - Price tampering: the amount charged always comes from the plan on sale, never from what the client sends; an archived or unknown plan is refused.
  - Hold squatting: a client can hold at most one hive at a time (AC-12), and every hold lapses after 15 minutes, so one person cannot block many hives.
  - Offensive or injected nickname: shown as plain text only, 1 to 40 characters, and clearable by an admin or the owning beekeeper.
- **Security review:** Required. This is the first payment integration, it adds new authorization boundaries, and it adds public user-generated text.

## 7. Metrics / KPIs

All KPIs count only real people's activity on test-mode payments; automated test runs are excluded.

- **Paid hive rentals** — baseline: 0, target: 10 before the first season starts.
- **Beekeepers with at least one paid hive rental** — baseline: 0, target: 5 before the first season starts.
- **Checkout conversion** (confirmed hive rentals ÷ checkout holds started) — baseline: 0 (no checkout exists), target: ≥ 50% over the first season's sales window.
- **Nickname adoption** (active hive rentals with a nickname within 7 days of payment) — baseline: 0, target: ≥ 70% over the first season's sales window.
- **Payment incidents** (hive rentals that needed a manual admin fix: duplicates, paid but not active, two clients on one hive) — baseline: 0, target: 0 across the first season.

## 8. Open questions

- [ ] Who covers a honey quota shortfall in a bad year? Default now: the beekeeper, from their other hives. — owner: ivan lysakov, due: before the honey-reservation PRD
- [ ] When does the platform pay the collected money out to the beekeeper? Default now: by hand, outside the product. — owner: ivan lysakov, due: before any real-money launch
- [ ] What happens when a colony dies or swarms, or the beekeeper drops out mid-season? Default now: the admin handles it by hand, outside the product. — owner: ivan lysakov, due: before the first season starts
- [ ] What is the capstone defence date? — owner: ivan lysakov, due: before /sdlc:break-tasks
- [ ] Which signal clears a hive's rented state at season end, given that the apiary rule only reacts to a suspended subscription? Default now: a new "subscription ended" event. — owner: ivan lysakov, due: during /sdlc:architecture-design
- [ ] Is test access to the payment provider available, and can a payment link's lifetime be set equal to the 15-minute checkout hold? — owner: ivan lysakov, due: first build slice
- [ ] Should gifting and the rental certificate return as a follow-up slice? Default now: deferred; revisit if the core payment slice ships with time left. — owner: ivan lysakov, due: after the first test payment goes through
- [ ] Which context owns season dates and shows a hive's checkout hold or rented state, given that the apiary must not check payment or subscription state? Default now: billing owns seasons and rental state; the apiary only reacts to its events. — owner: ivan lysakov, due: during /sdlc:architecture-design
