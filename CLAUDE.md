# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@ARCHITECTURE.md

## State of the repo

No application code yet. The stack is decided in `docs/adr/0001-initial-setup.md`: Next.js (App Router, TypeScript), PostgreSQL + Prisma, Tailwind CSS + shadcn/ui, Zod, NextAuth v4, Monobank acquiring; package manager is pnpm (`Makefile`). There is no `package.json` yet, so `make dev` and `make test` fail until the app is scaffolded. The test runner is undecided; don't assume one. Product scope is in `SPEC.md`, context boundaries in `docs/bc-map.md` and each `src/modules/<name>/README.md`.

What else exists is the Claude Code sandbox setup: `.claude/settings.json` and a devcontainer in `.devcontainer/` (also reachable via `docker compose up` from the root).

Claude runs on the macOS host, under the sandbox and permissions in `.claude/settings.json`. The devcontainer is the alternative runtime, not the default.

## Gotchas

- Outbound network is allowlisted in two places that must stay in sync: `sandbox.network.allowedDomains` in `.claude/settings.json` (host) and the `for domain in` list in `.devcontainer/init-firewall.sh` (container). They currently differ; when adding a domain, add it to both.
- Do not run `scripts/show-claude-settings.sh`: it prints `.env`.
- `.env.*` (including `.env.example`) is read/write-denied for Claude. To change `.env.example`, give the user the exact command to run.
- Monobank webhooks have no shared secret: verify the `X-Sign` header (ECDSA over the raw body) with the public key from `GET /api/merchant/pubkey`.
- Compose project, container, and volume names (`belikebee`, `belikebee_claude-config`, `belikebee_claude-history`) are fixed on purpose so `docker compose` and the devcontainer share one container and login. Don't rename them.

## Workflow

- Commit on `dev`; PRs go `dev` → `main`. `git push` is denied for Claude; the user pushes.
- Write code comments and docs in English.

## Architecture

- Modules inside `src/modules/` must be self-contained and communicate only via explicit public APIs or domain events. Cross-module imports must pass through `src/modules/<name>/index.ts` or `src/shared/`; never import another module's internal files.
- `src/shared/` must not import from `src/modules/` or `src/app/`. Domain event types live in `src/shared/events/`.
- Each Prisma model belongs to one module; only that module reads or writes its tables.
