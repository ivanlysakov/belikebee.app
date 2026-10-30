-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.
-- One row per payment state change, written in the same transaction (PRD §6: 100% audited). Append-only.
-- fromStatus is NULL for the row that records the payment's creation.
-- source: CHECKOUT | RETRY | WEBHOOK | RECONCILE (validated in app code).

CREATE TABLE IF NOT EXISTS "PaymentAuditEntry" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "fromStatus" VARCHAR(16),
    "toStatus" VARCHAR(16) NOT NULL,
    "source" VARCHAR(16) NOT NULL,
    "providerModifiedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAuditEntry_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PaymentAuditEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- FK; a payment's audit trail (activation-delay measurement, PRD §6).
CREATE INDEX IF NOT EXISTS "PaymentAuditEntry_paymentId_idx" ON "PaymentAuditEntry"("paymentId");
