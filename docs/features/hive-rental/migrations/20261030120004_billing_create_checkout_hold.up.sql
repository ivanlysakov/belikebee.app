-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.
-- A client's 15-minute claim on a hive, with the plan-terms snapshot taken at start (AC-05, AC-10).
-- status: HELD | LAPSED | CONVERTED (validated in app code). A CONVERTED hold stays the hive's claim
-- for the season, so the partial unique index below also guards activation (ADR-0006).
-- clientId and hiveId are plain IDs into identity and apiary: no foreign key.

CREATE TABLE IF NOT EXISTS "CheckoutHold" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "hiveId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "seasonPriceKopecks" INTEGER NOT NULL,
    "honeyQuotaGrams" INTEGER NOT NULL,
    "status" VARCHAR(16) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutHold_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CheckoutHold_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CheckoutHold_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ADR-0006: one live claim (held or converted) per hive and season. Also serves the hive page's live-hold read.
-- Hand-written partial unique index: Prisma cannot declare it.
CREATE UNIQUE INDEX IF NOT EXISTS "CheckoutHold_hiveId_seasonId_live_key" ON "CheckoutHold"("hiveId", "seasonId") WHERE "status" IN ('HELD', 'CONVERTED');
-- ADR-0006, AC-12: one held hold per client. Also serves AC-13b (return to own hold).
CREATE UNIQUE INDEX IF NOT EXISTS "CheckoutHold_clientId_held_key" ON "CheckoutHold"("clientId") WHERE "status" = 'HELD';
-- Checkout transaction: lapse held holds past their expiry before inserting (ADR-0006).
CREATE INDEX IF NOT EXISTS "CheckoutHold_held_expiresAt_idx" ON "CheckoutHold"("expiresAt") WHERE "status" = 'HELD';
-- FK; AC-09: does this season have a live hold?
CREATE INDEX IF NOT EXISTS "CheckoutHold_seasonId_idx" ON "CheckoutHold"("seasonId");
-- FK.
CREATE INDEX IF NOT EXISTS "CheckoutHold_planId_idx" ON "CheckoutHold"("planId");
