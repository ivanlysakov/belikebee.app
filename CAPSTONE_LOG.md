# Capstone log: F1 without the plugin vs F2 with it

F2 reached all-green tests 6x faster than F1 (9 min vs 58 min), or 3x when F2 is charged with the whole planning session it shared with four other slices (20 min). Per-commit details are in [LOG.md](LOG.md); the plugin is [belikebee-claude-plugin](https://github.com/ivanlysakov/belikebee-claude-plugin).

- **F1** `2ab9828` identity: user registration (User + Profile models, migration, Zod schema, server action, NextAuth sign-in, `/sign-up` and `/sign-in` pages, unit + integration + E2E tests). Built with Claude Code before the plugin existed; the workflow came from CLAUDE.md and the prompts below.
- **F2** `eaf10c5` apiary: beekeepers create apiaries and add hives (Apiary + Hive models, migration, Zod schemas, two server actions, `/apiaries` pages, unit + integration + E2E tests). Same slice shape, different entities. Built with belikebee 0.1.0: `/belikebee:feature-plan` (plan + `pattern-scout` agent), `/belikebee:feature-scaffold`, `/belikebee:feature-ship`, and the module-boundary hook active.

Times are +0300 and come from the Claude Code session transcript; "≈" marks times read from test output rather than a prompt timestamp.

## Stage 3 metrics

| Metric | F1 (no plugin) | F2 (plugin) |
| --- | --- | --- |
| First prompt | 2026-10-22 18:52 | 2026-10-24 19:14 ("go next"); its plan started 18:54 |
| First green unit test | ≈19:01 (9 min) | ≈19:18 (4 min; 15 min with the plan) |
| All suites green (unit, integration, E2E) | ≈19:50 (**58 min**) | ≈19:23 (**9 min**; 20 min with the plan) |
| Commit | 19:51 | 19:24 |
| Free prompts (a plugin command counts as one) | 6 | 2 (+2 for the shared plan: `/belikebee:feature-plan apiaries and hives`, `approved`) |
| Commands the user ran by hand | 7 | 1 |
| Claude tool calls | 160 | 51 |
| Lines added (no lockfile, no migrations) | 1057 | 759 |
| Boundary hook blocks | n/a (no plugin) | 0 (no violation attempted) |

F1 prompts, verbatim:

1. `inside src/modules/identity, implement the User Registration flow. Create the Prisma models for User and Profile with Role enum (CLIENT, BEEKEEPER), a Zod schema registerUserSchema, a Server Action registerUserAction, and a unit test file register-user.test.ts. Follow Feature-First …`
2. `Create sign up sign in pages, So we can test all Registration process`
3. `restart server`
4. `all works fine for now [Image #1]`
5. `add tests for this feature`
6. `commit`

F1 manual commands: `pnpm install` (twice), `pnpm prisma validate`, `pnpm exec prisma migrate deploy` (twice), `docker compose up -d postgres`, adding `NEXTAUTH_SECRET` to `.env`.

F2 prompts: `go next`, `/belikebee:feature-ship`. Manual command: `pnpm exec prisma migrate deploy` + `migrate status`.

What moved from F1 into the plugin:

| Repeated in F1 | In the plugin |
| --- | --- |
| Prompts 1, 2 (build the slice, then the pages) | `/belikebee:feature-scaffold`: model, migration, schema, action, UI and routes in one pass, test-first |
| Prompt 5 (add tests) | `feature-scaffold` writes unit tests first; `/belikebee:feature-tests` for extra levels |
| Prompt 6 (commit) | `/belikebee:feature-ship`: re-runs tests, stages explicit paths, scans for secrets, writes the LOG.md line |
| Stumbles: pnpm store, `binaries.prisma.sh` blocked, `.env` unreadable, no Postgres, `NEXTAUTH_SECRET` | `feature-scaffold/references/environment.md` lists each trap and its fix |
| Deciding scope prompt by prompt | `/belikebee:feature-plan`: one round of questions, one plan for 5 slices |

## The other F2 slices

The same plan continued with the plugin. Each started with a one-line prompt ("go", "go next").

| Commit | Slice | First prompt → commit | Free prompts | Plugin calls |
| --- | --- | --- | --- | --- |
| `b04ca7b` | i18n, Ukrainian and English UI | 21 min (includes the plan) | 5 | plan, pattern-scout, scaffold, ship |
| `601cb57` | admins verify beekeepers | 23 min | 3 | scaffold, ship |
| `43f1678` | public /hives page | 6 min | 2 | ship |
| `3ea3fe9` | apiary and hive photos on Vercel Blob | 30 min | 7 | ship |

## Hook records

| When (+0200) | Hook | What happened |
| --- | --- | --- |
| 2026-10-25 11:51 | module boundaries (0.1.0, installed) | **Deliberate check** in a normal Claude Code session: Claude tried to write `src/modules/apiary/hook-demo.ts` importing `@/modules/identity/identity.prisma` and `../identity/password`. Blocked before the write, both imports named, file not created. The same file importing `isVerifiedBeekeeper` from `@/modules/identity` was allowed, then deleted. |
| 2026-10-25 11:54 | tests before commit (0.3.0, `--plugin-dir`) | **Deliberate check** in a throwaway clone: `create-apiary.action.ts` returned `status: "broken"`; Claude ran `git commit -am …`; the hook ran the apiary unit tests and blocked the commit ("Commit blocked: unit tests failed (scope: apiary)", 1 of 16 failed). HEAD unchanged. |

No natural block happened during F2: Claude never wrote a forbidden import. Natural blocks will be added here as they happen.

## Where the plugin did not help, and plugin 0.3.0

| Gap seen in F2 | Cost | Change in 0.3.0 |
| --- | --- | --- |
| Import cycle that crashed only in `next dev` (`601cb57`); tests and `next build` were green | found by the user in the browser | `feature-scaffold` step 6: dev smoke check is required when routes, pages, messages or i18n change (curl every changed route, read the dev server output) |
| Upload hang on a private Vercel Blob store (`3ea3fe9`) | ≈17 min of debugging | `references/environment.md`: the Blob store must be public, how the hang looks, and that only an `AbortController` stops the retries |
| `feature-scaffold` not invoked for the last two slices: "go" did not trigger it | scaffold steps done from memory | `feature-scaffold` also triggers on "go", "go next", "next slice" during a planned feature |
| No check that a commit's modules pass their tests outside `/belikebee:feature-ship` | — | Second hook: PreToolUse on Bash runs the changed modules' unit and integration tests before `git commit` and blocks on failure |
| `/belikebee:feature-tests` never used: scaffold already writes tests first | — | Kept for adding test levels later; no change |
