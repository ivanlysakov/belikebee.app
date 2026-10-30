-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.

DROP INDEX IF EXISTS "Subscription_seasonId_idx";
DROP INDEX IF EXISTS "Subscription_clientId_idx";
DROP INDEX IF EXISTS "Subscription_hiveId_idx";
DROP INDEX IF EXISTS "Subscription_paymentId_key";
DROP INDEX IF EXISTS "Subscription_holdId_key";
DROP TABLE IF EXISTS "Subscription";
