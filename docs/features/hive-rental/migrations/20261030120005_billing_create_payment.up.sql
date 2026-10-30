-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.
-- One Monobank invoice. A hold can have many payments (retries within the hold, flow 10).
-- status: PENDING | PAID | FAILED (validated in app code). providerModifiedAt is Monobank's
-- modifiedDate of the last applied status change: the apply-once check compares against it.
-- A PAID payment with no Subscription is a "payment without a hive rental" (AC-19b).

CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL,
    "holdId" TEXT NOT NULL,
    "invoiceId" VARCHAR(64) NOT NULL,
    "paymentPageUrl" TEXT NOT NULL,
    "amountKopecks" INTEGER NOT NULL,
    "status" VARCHAR(16) NOT NULL,
    "providerModifiedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Payment_holdId_fkey" FOREIGN KEY ("holdId") REFERENCES "CheckoutHold"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Webhook and reconciliation: find the payment by Monobank invoice id.
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_invoiceId_key" ON "Payment"("invoiceId");
-- FK; hold screen: the hold's latest payment.
CREATE INDEX IF NOT EXISTS "Payment_holdId_createdAt_idx" ON "Payment"("holdId", "createdAt");
-- Reconciliation (flow 3): invoices still pending. Hand-written partial index.
CREATE INDEX IF NOT EXISTS "Payment_pending_createdAt_idx" ON "Payment"("createdAt") WHERE "status" = 'PENDING';
