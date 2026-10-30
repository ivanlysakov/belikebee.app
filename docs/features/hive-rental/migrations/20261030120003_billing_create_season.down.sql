-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.

DROP INDEX IF EXISTS "Season_endDate_idx";
DROP INDEX IF EXISTS "Season_apiaryId_endDate_idx";
DROP TABLE IF EXISTS "Season";
