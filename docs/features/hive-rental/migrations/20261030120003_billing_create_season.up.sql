-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.
-- An apiary's season (ADR-0004). apiaryId is a plain ID into the apiary module: no foreign key.
-- Dates are calendar dates read in Europe/Kyiv, both inclusive.

CREATE TABLE IF NOT EXISTS "Season" (
    "id" TEXT NOT NULL,
    "apiaryId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- Current or upcoming season of an apiary (set season, hive page, beekeeper area).
CREATE INDEX IF NOT EXISTS "Season_apiaryId_endDate_idx" ON "Season"("apiaryId", "endDate");
-- Season-end job: seasons whose end date is before today in Kyiv time.
CREATE INDEX IF NOT EXISTS "Season_endDate_idx" ON "Season"("endDate");
