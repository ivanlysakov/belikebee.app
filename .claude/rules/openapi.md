---
paths:
  - "docs/features/*/contracts/**"
  - "src/app/api/**"
  - "src/modules/*/*.action.ts"
---

# API contract rules

## Project overrides (decided 2026-10-30, hive-rental contract)

BeLikeBee's UI calls server actions, not a JSON API (hive-rental ADR-0003). These overrides win over the baseline below:

- **Contract files per feature.** `contracts/openapi.yaml` covers only real HTTP route handlers (webhooks from external systems, cron job endpoints, uploads). `contracts/server-actions.md` covers the server actions and read functions a module exports through `index.ts` for the UI. `contracts/events.md` covers domain events.
- **Paths** follow the existing routes: `/api/<module>/...` and `/api/jobs/<job>`, no `/api/v1`. A webhook URL is registered with the provider, so a breaking change gets a new path rather than a version prefix.
- **Auth per endpoint**, not one global scheme: NextAuth session cookie for server actions; `Authorization: Bearer <CRON_SECRET>` for job endpoints; the provider's signature header for webhooks (Monobank `X-Sign`, ECDSA over the raw body).
- **Server action errors** keep the repo's result-union shape (`src/modules/apiary/add-hive.action.ts`): `{ status: "error", formError: "<key>" }` or `{ status: "error", fieldErrors: { <field>: ["<key>"] } }`. `<key>` is camelCase and must exist under `errors` in `src/modules/<module>/messages/{uk,en}.json`; that file is the error registry. The contract writes it as `<module>.<key>` (`billing.planNotFound`).
- **Route handler errors** use the `{code, message, details?}` envelope with snake_case `module.error_name` from the baseline.
- **Domain events** keep the `src/shared/events` shape: PascalCase `type` (`PaymentSucceeded`), camelCase `payload`, `occurredAt`; delivered through the outbox with its `id` (hive-rental ADR-0005). Not `module.action.vN`.
- **JSON keys**: external payloads keep the provider's casing (Monobank is camelCase); our own route responses use snake_case; server action and event types use TypeScript camelCase.
- **Cron endpoints are `GET`** because Vercel Cron only sends `GET`; they must still be safe to run twice.

## Baseline (from the api-forge skill; the overrides above win)

<!-- Bootstrapped by sdlc/plugin/skills/api-forge on the first HTTP run. Edit freely. -->
<!-- These rules are an opinionated default — see "Defaults" in SKILL.md. A team edit here, or an ADR, is the only way to deviate; api-forge reads this file on every run and records deviations in api-sync-report.md. -->

### Where the contract lives

- `docs/features/<slug>/contracts/openapi.yaml` is the source of truth for the HTTP surface. Handlers, clients, mocks and contract tests follow it — never the other way round.
- The contract is **derived** (`data-model.md` + `sad.md` §6 sequences + `PRD.md` AC) by `/sdlc:api-forge <slug>`. After a hand edit or an upstream change, run `/sdlc:api-forge <slug> --reconcile` so `api-sync-report.md` stays true.
- `info.version` bumps only with an explicit CHANGELOG line, never silently.

### Hard rules

- OpenAPI **3.1.0**. Nullability via `type: [string, null]`; `nullable: true` (3.0 style) is forbidden.
- Every error response is the envelope `{code, message, details?}`. `code` is `module.error_name` in snake_case (`lesson.not_found`, `course.not_methodist`) — never free text like `{"error": "failed"}`.
- One error `code` in the contract = one definition in the repo's error registry (constants / enum / sentinel module — whatever the repo uses), returning the **same string** the contract advertises.
- Shared types via `$ref` only; no inline duplicated schemas.
- No `additionalProperties: true` on response shapes. Exception only by ADR (e.g. a polymorphic payload) and noted in the report.
- No real PII in `example` blocks: `<name>@example.test`, `+380 00 000 00 00`, `Test User`.

### Defaults

- URL versioning `/api/v1/...`; never `?v=2` query versioning.
- `BearerAuth` global; a public endpoint declares explicit `security: []`.
- Lists paginate by **cursor** (`?after=&before=&limit=`), wrapped in `{items, has_next, has_prev, next_cursor}`; never offset.
- JSON keys snake_case. Schema names use the domain language of `data-model.md` (`Lesson`, `CreateLessonRequest`) — not a Go/TS/Python idiom, not a driver's error type.
- A mutating endpoint behind a retry or an async actor requires an `Idempotency-Key` header (state the TTL).
- Status by class: `400` validation, `401` no/invalid token, `403` not allowed, `404` existence-hiding, `409` state or uniqueness conflict, `429` rate limit, `5xx` server. Every `4xx`/`5xx` carries the envelope.

### Checks

- `spectral lint docs/features/<slug>/contracts/openapi.yaml` is in the project's check target (`make check` or stack-equivalent).
- A change to the contract and the matching handler/client land in the same PR, with `api-sync-report.md` re-run (`--reconcile`) and its `**Verdict:**` at `PASS` or `PASS (with deferrals)`.
