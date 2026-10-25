# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@ARCHITECTURE.md

## State of the repo

The stack is decided in `docs/adr/0001-initial-setup.md`: Next.js (App Router, TypeScript), PostgreSQL + Prisma, Tailwind CSS + shadcn/ui, Zod, NextAuth v4, Monobank acquiring; package manager is pnpm. Product scope is in `SPEC.md`, context boundaries in `docs/bc-map.md` and each `src/modules/<name>/README.md`.

Only `identity` has code (registration, sign-in, sessions); the other modules have a README only. Prisma models live in `src/modules/<name>/<name>.prisma`, migrations in `src/shared/db/migrations/`. Postgres for development is the `postgres` service in `docker compose`.

Tests: Vitest for unit (`pnpm test`, `*.test.ts`, mocked) and integration (`pnpm test:int`, `*.int.test.ts`, real `belikebee_test` database); Playwright for E2E (`pnpm test:e2e`, production build on port 3100). Integration and E2E need Postgres up and run outside the sandbox. `make dev` and `make test` wrap `pnpm dev` and `pnpm test`.

Claude Code setup: `.claude/settings.json` enables the `belikebee` plugin (separate repo `belikebee-claude-plugin`), which provides the skills `/belikebee:feature-plan`, `/belikebee:feature-scaffold`, `/belikebee:feature-tests`, `/belikebee:feature-ship`, the `belikebee:pattern-scout` subagent, and a PreToolUse hook that blocks module-boundary violations. Change them in the plugin repo, not here. `.claude/hooks/test-changed-modules.sh` exists but is not registered. A devcontainer is in `.devcontainer/` (also reachable via `docker compose up` from the root).

Claude runs on the macOS host, under the sandbox and permissions in `.claude/settings.json`. The devcontainer is the alternative runtime, not the default.

## Gotchas

- Outbound network is allowlisted in two places that must stay in sync: `sandbox.network.allowedDomains` in `.claude/settings.json` (host) and the `for domain in` list in `.devcontainer/init-firewall.sh` (container). They currently differ; when adding a domain, add it to both.
- Do not run `scripts/show-claude-settings.sh`: it prints `.env`.
- `.env.*` (including `.env.example`) is read/write-denied for Claude. To change `.env.example`, give the user the exact command to run.
- Monobank webhooks have no shared secret: verify the `X-Sign` header (ECDSA over the raw body) with the public key from `GET /api/merchant/pubkey`.
- Compose project, container, and volume names (`belikebee`, `belikebee_claude-config`, `belikebee_claude-history`) are fixed on purpose so `docker compose` and the devcontainer share one container and login. Don't rename them.

## Workflow

- Commit on `dev`; PRs go `dev` → `main`. `git push` is denied for Claude; the user pushes.
- After each commit that touches `src/modules/`, append one line to `LOG.md` in the repo root (create it if missing): `<timestamp> | <short description> | repeated prompts: "<verbatim>" | manual checks: <tests, migration check, lint> | stumbles: <errors, rollbacks, rework> | time: <first prompt → green test>`. Timestamp is ISO 8601 with offset (`date +%Y-%m-%dT%H:%M:%S%z`). Write `none` for an empty field.
- Write code comments and docs in English.

## Architecture

- Modules inside `src/modules/` must be self-contained and communicate only via explicit public APIs or domain events. Cross-module imports must pass through `src/modules/<name>/index.ts` or `src/shared/`; never import another module's internal files.
- `src/shared/` must not import from `src/modules/` or `src/app/`. Domain event types live in `src/shared/events/`.
- Each Prisma model belongs to one module; only that module reads or writes its tables.
