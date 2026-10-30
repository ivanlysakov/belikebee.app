-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.
-- The hive rental (ADR-0004): created from a converted hold and its paid payment.
-- status: ACTIVE | ENDED (validated in app code). Read-side status also treats a rental past its
-- season end as ended (AC-26); the season-end job sets ENDED and endedAt (ADR-0007).
-- clientId, hiveId, seasonId are copies of the hold's values, kept here for the read paths.
-- nicknameClearedAt is the moderation notice (AC-27): set when cleared, reset to NULL when a new nickname is saved.

CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "holdId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "hiveId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "status" VARCHAR(16) NOT NULL,
    "nickname" VARCHAR(40),
    "nicknameClearedAt" TIMESTAMPTZ(3),
    "endedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Subscription_holdId_fkey" FOREIGN KEY ("holdId") REFERENCES "CheckoutHold"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subscription_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subscription_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- FK; one hive rental per hold.
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_holdId_key" ON "Subscription"("holdId");
-- FK; AC-16: one hive rental per payment, so a replayed confirmation cannot create a second one.
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_paymentId_key" ON "Subscription"("paymentId");
-- Public hive list and hive page: active rental and nickname per hive (flow 7); nickname clearing (flow 14).
CREATE INDEX IF NOT EXISTS "Subscription_hiveId_idx" ON "Subscription"("hiveId");
-- Client area; AC-12 overlapping-season check in the checkout transaction.
CREATE INDEX IF NOT EXISTS "Subscription_clientId_idx" ON "Subscription"("clientId");
-- FK; beekeeper season revenue (flow 12), AC-09 rental check, season-end job join (flow 13).
CREATE INDEX IF NOT EXISTS "Subscription_seasonId_idx" ON "Subscription"("seasonId");
