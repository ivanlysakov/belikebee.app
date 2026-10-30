---
paths:
  - "src/modules/scheduling/**"
---

# Scheduling context: boundaries

Full description: `src/modules/scheduling/README.md`. These rules apply to every file under `src/modules/scheduling/`.

## Owns

- Prisma models for Visit Slot and Booking, and the Visit Type values `OnlineMasterclass` and `OfflineVisit`.
- Its public API is `src/modules/scheduling/index.ts`. Export only what other code needs today.

## Forbidden

- Confirming a booking on the client's behalf. A client's request creates a requested Booking (`VisitBookingRequested`); only the Beekeeper who published the slot confirms it (`VisitBookingConfirmed`).
- Unlocking a client's included bookings in any way other than reacting to `SubscriptionActivated`, or keeping them after `SubscriptionSuspended`. Plan selection alone is not payment.
- Charging for visits or masterclasses. That is `billing`.
- Sending booking confirmations or reminders. `notifications` delivers them in response to this module's events.
- Recording hive work done during a visit. That is a Hive Log in `apiary`.
- Storing slot times in local time. Store UTC and convert to `Europe/Kyiv` only for display (`SPEC.md` §4, Localization).
