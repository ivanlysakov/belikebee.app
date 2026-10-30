-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.
-- Brownfield: the apiary module's rented mark on an existing table (ADR-0004, ADR-0005, ADR-0007).
-- Set on PaymentSucceeded; cleared on SubscriptionEnded or SubscriptionSuspended only when it still
-- holds that event's subscription id, so a late end event never clears next season's mark.
-- Nullable, no default, no index (written by primary key): safe on a live table, no 3-step needed.
-- Plain ID into billing: no foreign key.

ALTER TABLE "Hive" ADD COLUMN IF NOT EXISTS "rentedSubscriptionId" TEXT;
