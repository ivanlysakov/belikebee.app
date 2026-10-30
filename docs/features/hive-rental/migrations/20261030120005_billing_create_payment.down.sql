-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.

DROP INDEX IF EXISTS "Payment_pending_createdAt_idx";
DROP INDEX IF EXISTS "Payment_holdId_createdAt_idx";
DROP INDEX IF EXISTS "Payment_invoiceId_key";
DROP TABLE IF EXISTS "Payment";
