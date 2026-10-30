-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.

DROP INDEX IF EXISTS "Plan_onSale_createdAt_idx";
DROP TABLE IF EXISTS "Plan";
