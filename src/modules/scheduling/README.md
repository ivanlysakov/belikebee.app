# Scheduling & Visits Context

Calendars and bookings: when a client can watch or visit the apiary.

## Owns

- **Visit Slot**: an available time window published by a beekeeper.
- **Visit Type**: `OnlineMasterclass` (live apiary stream) or `OfflineVisit` (in-person visit).
- **Booking**: a client's reservation of a specific slot, requested and then confirmed by the beekeeper.

## Publishes

- `VisitBookingRequested`
- `VisitBookingConfirmed`
- `VisitReminderTriggered`: published by a scheduled job shortly before a confirmed booking's slot.

## Consumes

- `SubscriptionActivated` (from `billing`): unlocks the bookings included in the client's plan.
- `SubscriptionSuspended` (from `billing`): locks them again.

## Out of scope

- Charging for visits or masterclasses → `billing`.
- Hive work done during a visit → `apiary` (as a Hive Log).
- Reminders and confirmations sent to users → `notifications`.
