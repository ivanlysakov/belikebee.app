# Audit — data model, hive-rental, 2026-10-30

Skill: `generate-data-model` (greenfield for `billing` and `src/shared`, one brownfield `ALTER` on `apiary`'s `Hive`).

## Generated files

- `docs/features/hive-rental/data-model.md`
- Staged migration pairs, `docs/features/hive-rental/migrations/`:
  - `20261030120000_shared_create_outbox_event.{up,down}.sql`
  - `20261030120001_shared_create_processed_event.{up,down}.sql`
  - `20261030120002_billing_create_plan.{up,down}.sql`
  - `20261030120003_billing_create_season.{up,down}.sql`
  - `20261030120004_billing_create_checkout_hold.{up,down}.sql`
  - `20261030120005_billing_create_payment.{up,down}.sql`
  - `20261030120006_billing_create_payment_audit_entry.{up,down}.sql`
  - `20261030120007_billing_create_subscription.{up,down}.sql`
  - `20261030120008_apiary_add_hive_rented_subscription_id.{up,down}.sql`
- `.claude/rules/migrations.md`: bootstrapped from the skill's baseline, with a "Project overrides" section on top that records the conventions decided in this run.

The migrations are **staged**, not in the live `src/shared/db/migrations/` tree. implement-tasks promotes each one into a Prisma directory `src/shared/db/migrations/<timestamp>_<module>_<description>/migration.sql`, re-stamping the timestamp at promote time and keeping this order. Prisma has no down migrations; the `.down.sql` files are the manual rollback scripts.

## Verification

- Applied every `.up.sql` twice to a scratch database (`belikebee_dm_check` on the dev Postgres 17 container, with a stand-in `Hive` table): the second run only printed "already exists, skipping". Applied every `.down.sql` in reverse: only the stand-in `Hive` with its original columns remained. Re-applied the ups. Dropped the scratch database. Dev and test databases were not touched.
- In the scratch database: a second client's `HELD` hold on the same hive and season failed on `CheckoutHold_hiveId_seasonId_live_key`; a second `HELD` hold for the same client on another hive failed on `CheckoutHold_clientId_held_key`; after lapsing the first hold, another client's hold succeeded; turning the lapsed hold to `CONVERTED` then failed on the live-claim index (the AC-19b guard).
- `erDiagram` parsed with `mermaid@11` (`mermaid.parse` → `er`).
- Self-checks, 4/4 pass: naming (`<timestamp>_<module>_<verb>_<entity>`, all 18 files); every `.up` has a `.down` that drops each table, index and column it creates; every foreign key column has an index (7/7); no `CHECK (`, `CREATE TRIGGER`, `DEFAULT '…'`, function or sequence.

## Convention divergences

Decided by the user in this run: Prisma naming and `cuid()` IDs from the repo, the "DB as dumb storage" rules from the course.

| Course default | This feature | Why |
|---|---|---|
| UUID v7 PK | `cuid()` `TEXT` | Repo and sad §8 |
| Plural `snake_case` tables | PascalCase singular, camelCase columns | Repo (Prisma); keeps one naming style in the database |
| `<ts>_<verb>_<entity>` | `<ts>_<module>_<verb>_<entity>` | Repo migration names carry the module |
| `created_at` only | `updatedAt` on `Season` and `Subscription` | User decision: season dates (AC-06b) and nickname/status change |
| `IF NOT EXISTS` with separate `ALTER TABLE … ADD CONSTRAINT` | Foreign keys inline in `CREATE TABLE` | Keeps each file idempotent; same resulting schema as Prisma's output |

Divergences from the existing repo schema, introduced here on purpose:

| Repo today | This feature | Why |
|---|---|---|
| `TIMESTAMP(3)` (no time zone) | `TIMESTAMPTZ(3)` | Course default; sad §8 stores UTC and reads Kyiv time. Existing tables are not changed |
| Prisma `enum Role` | Statuses as `VARCHAR(16)`, app-side unions | DB stays dumb; `CREATE TYPE` has no `IF NOT EXISTS` |
| `String` → `TEXT` for names | `VARCHAR(n)` (`name` 100, `nickname` 40, `invoiceId` 64) | Course default; bounds from PRD AC-21 and the repo's 100-character name limit |
| `updatedAt` on every model | Only where justified | Immutable-first; history is in `PaymentAuditEntry` |

## Drift findings

**Schema vs source.** `billing` has no code yet, so there is nothing to compare. `apiary`'s `Hive` model (`src/modules/apiary/apiary.prisma`) lacks `rentedSubscriptionId`; that is the new column, not drift. No `_drift/` proposals.

**Model vs spec.**

- Every PRD §4–§5 entity has a table: plan (US-01), season (US-02), checkout hold (US-03, US-05), payment (US-04, US-05), hive rental with hive nickname and moderation notice (US-04, US-06, US-10), rented mark (AC-17). Every table traces to PRD or SAD; no orphan tables.
- `sad.md` has no §6.4 ER stub; relationships come from sad §5 (`billing.prisma` model list), the §6 flows and the "Flagged for … generate-data-model" list. All six billing models and both outbox models in sad §5 have a table.
- SAD index hint "`Plan` by status": modelled as `archivedAt` (NULL = on sale) with a partial index, because archiving is the only state change.
- SAD index hint "`Subscription` … by status with season end": served by `Season_endDate_idx` plus `Subscription_seasonId_idx`, not a separate status index.
- sad §6 flagged "season lock vs checkout start" as a candidate ADR-0006 amendment. `data-model.md` § Concurrency notes proposes the answer (lock the `Season` row in both transactions; advisory lock on the apiary id for the first season). It needs no schema change, but ADR-0006 should be amended to say so.
- The shape of the rented mark was open in sad §5. It is `Hive.rentedSubscriptionId`, so a late `SubscriptionEnded` from last season cannot clear this season's mark. `.claude/rules/apiary.md` still lists only `SubscriptionSuspended`; that amendment is already tracked in sad §11.
- `.claude/rules/billing.md` "Owns" lists Invoice/Payment, Honey Quota and Honey Reservation. Honey quota is a column on `Plan` and the hold snapshot; Honey Reservation is out of scope (PRD §3). The rules update is tracked in sad §11.

## Breaking changes decomposed

None. The only change to an existing table adds a nullable column with no default and no index.

## For implement-tasks

- Write `billing.prisma` and `src/shared/db/outbox.prisma` so that `prisma migrate dev --create-only` generates SQL equivalent to the staged files (mapping in `data-model.md` § Prisma models), then replace or append the hand-written partial indexes (†).
- Check whether Prisma 7.10 can declare partial indexes. If it cannot, any later Prisma-generated migration that drops a † index must be edited by hand (sad §11 risk); the QG-1 concurrency test catches a missing one.

## TBDs

- `docs/features/hive-rental/data-model.md:195`: maximum length of Monobank `invoiceId` (`VARCHAR(64)` for now); confirm in the first build slice.
