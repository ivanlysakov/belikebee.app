# Apiary & Hive Operations Context

The physical side of the product: apiaries, hives, and the work beekeepers do on them. This is where the hive's digital twin lives.

## Owns

- **Apiary**: a physical location with a group of hives, owned by a Beekeeper.
- **Digital Twin / Hive**: a specific physical hive with a QR code, history, and characteristics.
- **Hive Log**: an inspection or work report by the beekeeper (photos, frames, health checks, treatments, notes).
- **Work Order**: a client's request for a specific maintenance task on their hive.

## Publishes

- `HiveAddedToPlatform`
- `HiveLogEntryCreated`

## Consumes

- `PaymentSucceeded` (from `billing`): marks the hive as rented by the client.

## Out of scope

- Pricing, plans, invoices, and honey quotas → `billing`.
- Visit slots and bookings at the apiary → `scheduling`.
- Sending the "new hive update" message to the client → `notifications`.
