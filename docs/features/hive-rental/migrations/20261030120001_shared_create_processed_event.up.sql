-- Staged by generate-data-model (hive-rental). Not live: implement-tasks promotes this into
-- src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql, re-stamped.
-- Shared infrastructure (ADR-0005): one row per consumer per handled event, for at-least-once delivery.
-- eventId has no foreign key so outbox rows can be pruned later without touching consumers.

CREATE TABLE IF NOT EXISTS "ProcessedEvent" (
    "id" TEXT NOT NULL,
    "consumer" VARCHAR(64) NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedEvent_pkey" PRIMARY KEY ("id")
);

-- Handler idempotency check: has this consumer already handled this event?
CREATE UNIQUE INDEX IF NOT EXISTS "ProcessedEvent_consumer_eventId_key" ON "ProcessedEvent"("consumer", "eventId");
