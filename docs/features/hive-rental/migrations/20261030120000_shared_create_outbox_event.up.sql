-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.
-- Shared infrastructure (ADR-0005): domain events written in the state change's transaction.

CREATE TABLE IF NOT EXISTS "OutboxEvent" (
    "id" TEXT NOT NULL,
    "type" VARCHAR(64) NOT NULL,
    -- Opaque event payload: its shape is the event contract in src/shared/events, not a table schema.
    "payload" JSONB NOT NULL,
    "occurredAt" TIMESTAMPTZ(3) NOT NULL,
    "attempts" INTEGER NOT NULL,
    "lastError" TEXT,
    "deliveredAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- Dispatcher and sweep: pending events, oldest first. Hand-written partial index.
CREATE INDEX IF NOT EXISTS "OutboxEvent_pending_createdAt_idx" ON "OutboxEvent"("createdAt") WHERE "deliveredAt" IS NULL;
