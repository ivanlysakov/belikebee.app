# Notification Subsystem Context

Delivers messages to users. It holds no business rules of its own: it reacts to events from other contexts and turns them into messages.

## Owns

- **Notification**: a message to one user, with its channel and delivery status.
- **Channel**: `Push` or `Telegram` (Telegram Bot API).
- **Template**: the text for each event type and locale.

## Publishes

- `NotificationSent`

## Consumes

- `UserRegistered` (from `identity`)
- `PaymentSucceeded`, `PaymentFailed` (from `billing`)
- `HiveLogEntryCreated` (from `apiary`)
- `VisitBookingRequested`, `VisitBookingConfirmed` (from `scheduling`)

## Out of scope

- Deciding _whether_ something happened: other contexts publish the event, this one only delivers it.
- Storing user notification preferences → `identity` (read through its public API).
