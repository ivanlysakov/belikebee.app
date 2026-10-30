-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.

DROP INDEX IF EXISTS "CheckoutHold_planId_idx";
DROP INDEX IF EXISTS "CheckoutHold_seasonId_idx";
DROP INDEX IF EXISTS "CheckoutHold_held_expiresAt_idx";
DROP INDEX IF EXISTS "CheckoutHold_clientId_held_key";
DROP INDEX IF EXISTS "CheckoutHold_hiveId_seasonId_live_key";
DROP TABLE IF EXISTS "CheckoutHold";
