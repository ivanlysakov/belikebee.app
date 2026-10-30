-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.
-- Plan terms (seasonPriceKopecks, honeyQuotaGrams) never change after insert (AC-04); archiving sets archivedAt.

CREATE TABLE IF NOT EXISTS "Plan" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "seasonPriceKopecks" INTEGER NOT NULL,
    "honeyQuotaGrams" INTEGER NOT NULL,
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- Catalogue: plans on sale, in creation order (hive page, admin list). Hand-written partial index.
CREATE INDEX IF NOT EXISTS "Plan_onSale_createdAt_idx" ON "Plan"("createdAt") WHERE "archivedAt" IS NULL;
