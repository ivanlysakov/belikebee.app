---
paths:
  - "src/modules/notifications/**"
---

# Notifications context: boundaries

Full description: `src/modules/notifications/README.md`. These rules apply to every file under `src/modules/notifications/`.

## Owns

- Prisma models for Notification (with channel and delivery status) and Template.
- Delivery over `Push` and `Telegram` (Telegram Bot API). No other module sends messages to users.
- Its public API is `src/modules/notifications/index.ts`. Export only what other code needs today.

## Forbidden

- Business rules. This module does not decide whether something happened; it turns a received event into a message. Don't re-check payment, hive, or booking state in other modules before sending.
- Subscribing to events other than those listed under "Consumes" in the README without updating the README and `docs/bc-map.md` in the same change.
- Changing state in other modules or calling them for anything except reading data. Contact info and notification preferences come from `identity` through `@/modules/identity`; don't store a copy here.
- Publishing any event other than `NotificationSent`.
- Letting a failed delivery fail the publisher. Record the failure on the Notification's status; never throw back into the code that published the event.
