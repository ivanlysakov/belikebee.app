-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.

DROP INDEX IF EXISTS "PaymentAuditEntry_paymentId_idx";
DROP TABLE IF EXISTS "PaymentAuditEntry";
