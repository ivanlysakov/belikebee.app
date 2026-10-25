---
feature: home
status: Approved
owner: Product owner (decisions), frontend engineer (implementation)
updated_at: 2026-10-25
---

# Design spec: Home — the first screen of BeLikeBee

## 1. Raw request

> Головна / зараз — заголовок і три посилання. Зробити з неї перший екран BeLikeBee: гість за кілька секунд розуміє, що тут орендують справжній вулик на пасіці, і переходить до списку вуликів; пасічник і адмін, як і зараз, бачать свої посилання. Тільки наявна дизайн-система, без нових залежностей.

## 2. Why now

- **Problem:** `/` shows the word "BeLikeBee" and a few underlined links. A guest cannot tell what the product is or why to click "Browse hives".
- **User:** a guest (future Client) landing on `/`; also signed-in Beekeepers and Admins, who use `/` as their hub.
- **Trigger:** the public hive list (`/hives`) and the public hive profile (`/hives/[id]`) now exist, so the home page has a real place to send guests.
- **Success outcome:** within the first viewport, without scrolling, a guest reads that BeLikeBee rents out a real hive at an apiary, and one click on the primary action opens `/hives`. Signed-in users still reach their role links from `/`.

## 3. Evidence sources

| Status | Source | What it proves |
|---|---|---|
| Observed | `src/app/page.tsx:5-54` | Current home: `h1.type-title` "BeLikeBee", underlined link to `/hives` (`apiary.nav.browseHives`), then either the session block (signed-in text, role link, `SignOutButton`) or the signed-out sentence with links to `/sign-in` and `/sign-up`. |
| Observed | `src/app/layout.tsx:18-21` | Every page renders inside `main.mx-auto.grid.max-w-sm.gap-6.px-6.py-16`, with `LanguageSwitcher` above the page content. |
| Observed | `src/app/messages/{uk,en}.json` | Home texts live under `app.home` (`signedInAs`, `signedOut`). |
| Observed | `src/modules/apiary/messages/{uk,en}.json` | `apiary.nav.browseHives` = "Переглянути вулики" / "Browse hives"; `apiary.profile.rentalTitle` = "Оренда відкриється разом із планами" / "Renting opens together with plans". |
| Observed | `src/modules/identity/messages/uk.json:41-42` | `identity.admin.link` = "Підтвердити пасічників" ("Verify beekeepers" in en). |
| Observed | `docs/design/design-system.md`, `src/app/globals.css:43-47,71-92` | Roles, `.theme-apiary` override (wax-100 background, propolis-900 text, comb-600 muted), `--comb-cell`, `--hive-frame`, text roles `type-title` / `type-section` / `type-muted` / `type-error`, utility `wax-foundation`. |
| Observed | `src/modules/apiary/ui/hive-profile.tsx:9-17,41-45` | Precedent for an apiary-themed page: `theme-apiary` wrapper, a fixed `aria-hidden` backdrop `bg-background` + `bg-comb-cell wax-foundation`, `hr.w-12.border-hive-frame` as a section mark. The comment there says the serif is the hive's and the beekeeper's voice, and the platform speaks in sans. |
| Observed | `src/shared/ui/button.tsx:6-26,44-50` | `Button` variants/sizes, `asChild` renders the child (a `Link`) with button styles; `focus-visible:ring-[3px] ring-ring/50`; `whitespace-nowrap`. |
| Observed | `src/modules/identity/ui/sign-out-button.tsx` | `SignOutButton` = `Button variant="outline"`, signs out to `/sign-in`. |
| Observed | `e2e/apiaries.spec.ts:37-39`, `e2e/registration.spec.ts:10-17,36-37`, `e2e/helpers.ts:35,56`, `e2e/apiaries.spec.ts:59-60` | Existing tests rely on home: exactly one link named "Browse hives" that leads to `/hives`; text "Signed in as {email} (Beekeeper)"; button "Sign out"; link "create an account"; link "Verify beekeepers" for an admin; no "My apiaries" link for a client. |
| Observed | `src/app/i18n/messages.test.ts` | uk and en must have the same keys. |
| Observed | `belikebee` plugin hook `check-design-tokens.sh` | Blocks hex/oklch/rgb colors, Tailwind palette colors, and arbitrary text sizes in `.tsx` under `src/`. |
| Observed | `SPEC.md` §1, §3 UC-1; `src/modules/billing/README.md` (no code) | Product: city residents rent a real hive at a countryside apiary, a beekeeper looks after it, the honey goes to the client. Renting (plans, payment) is not built yet. |
| Observed | contrast computed from `globals.css` OKLCH values | `comb-600` on `wax-100` = 5.30:1; `comb-600` on `wax-300` (comb lines) = 4.35:1; `propolis-900` on `wax-300` = 10.01:1; `primary-foreground` on `primary` = 17.16:1; `primary` on `wax-300` = 11.92:1. |
| Confirmed | User answer, 2026-10-25 | Visual tone: `.theme-apiary` backdrop, all home text in the app's sans (no serif). |
| Confirmed | User answer, 2026-10-25 | The hero is shown to everyone; the session/role block sits below it. |
| Confirmed | User answer, 2026-10-25 | No hive preview on home; a single action to `/hives`. |
| Confirmed | User answer, 2026-10-25 | An honest note that renting is not open yet. |
| Confirmed | Raw request | Existing design system only; no new dependencies. |
| Confirmed | User approval, 2026-10-25 | Exact headline, lead, and rental-note wording (section 11). |
| Confirmed | User approval, 2026-10-25 | Backdrop markup repeated in `src/app/page.tsx` instead of extracted; brand as a `type-muted` line above the `h1` (section 14). |
| Confirmed | User answer, 2026-10-25 | Code-first: no Figma or Pencil frames; DOD-03 is answered by `verify-ui` screenshots. |

## 4. Current user flow

1. **Start:** anyone opens `/`. The server reads the session (`getSession()`), and the page renders on the server with no client-side loading state.
2. **Action (guest):** sees "BeLikeBee" and the "Browse hives" link, plus "Sign in or create an account."
3. **Action (signed in):** sees "Signed in as **email** (role)". A Beekeeper gets "My apiaries", an Admin gets "Verify beekeepers", a Client gets no role link. Everyone gets "Sign out".
4. **Success:** a click on a link opens `/hives`, `/sign-in`, `/sign-up`, `/apiaries`, or `/admin/beekeepers`. "Sign out" ends the session and opens `/sign-in`.
5. **Recovery:** none on this page; a server error falls back to Next.js's default error page.

## 5. Target user flow

1. **Start:** anyone opens `/`. The page renders on the server exactly as now: no new data calls, no client loading state.
2. **Action (guest):** above the fold they see the brand, a headline that a real hive at an apiary is rented here, one lead sentence, a primary button "Переглянути вулики" / "Browse hives", and a muted note that renting opens together with plans. Below that: "Sign in or create an account."
3. **Action (signed in):** the same hero, then the session block with today's content and behavior for each role.
4. **Success:** the primary button opens `/hives`; all other links and "Sign out" behave as today.
5. **Recovery:** unchanged; there is no form and no fetch on this page.

## 6. Requirements

| ID | Status | Requirement | Source |
|---|---|---|---|
| BR-01 | Confirmed | The home page stays at route `/` in `src/app/page.tsx`. `src/app/layout.tsx` (the `max-w-sm` column, `LanguageSwitcher`, `<title>`) is not changed. | Raw request, `src/app/layout.tsx` |
| BR-02 | Confirmed | At 375×667 and 1440×900 a guest sees, without scrolling: the brand "BeLikeBee", an `h1` saying a real hive at an apiary is rented here, one lead sentence, the primary action, and the rental note. | Raw request ("за кілька секунд розуміє") |
| BR-03 | Observed | The page has exactly one link to `/hives`. Its accessible name is `apiary.nav.browseHives` ("Переглянути вулики" / "Browse hives"), it is styled as `Button` (`variant="default"`, `size="lg"`, `asChild` around `next/link`), and a click opens `/hives`. | Raw request, `e2e/apiaries.spec.ts:38`, `button.tsx` |
| BR-04 | Confirmed | Next to the primary action, a `type-muted` note says renting opens together with plans. No price, plan, or "rent" button appears. | User answer, `billing` has no code, `apiary.profile.rentalTitle` |
| BR-05 | Confirmed | The page uses `.theme-apiary` and the same fixed `aria-hidden` comb backdrop as the hive profile (`bg-background` + `bg-comb-cell wax-foundation`). All home text uses the app's sans: no `font-serif`, no `@fontsource-variable/alegreya` import in the home page. | User answer, `hive-profile.tsx:9-16` |
| BR-06 | Confirmed | The hero is the same for every visitor and comes first. The session block follows below it, visually separated by `hr.w-12.border-hive-frame`, as in `hive-profile.tsx:41`. | User answer |
| BR-07 | Observed | Guest session block: `app.home.signedOut` with links "Увійдіть"/"Sign in" → `/sign-in` and "створіть акаунт"/"create an account" → `/sign-up`. | `src/app/page.tsx:36-50`, `e2e/registration.spec.ts:17,37` |
| BR-08 | Observed | Signed-in session block: `app.home.signedInAs` with the email in `<strong>` and the translated role. BEEKEEPER → link `apiary.nav.myApiaries` → `/apiaries`; ADMIN → link `identity.admin.link` → `/admin/beekeepers`; CLIENT → no role link. Everyone gets `SignOutButton` (→ `/sign-in`). | `src/app/page.tsx:15-35`, `e2e/registration.spec.ts:12-15`, `e2e/helpers.ts:56`, `e2e/apiaries.spec.ts:60` |
| BR-09 | Confirmed | Only the existing design system: role utilities, existing text roles (`type-title`, `type-muted`), `Button`, the global `wax-foundation` utility. No raw colors or arbitrary sizes in markup. No new palette entry, role, text role, or utility in `globals.css`. No new package in `package.json`. | Raw request, `check-design-tokens.sh`, `design-system.md` |
| BR-10 | Observed | Every visible string (except the brand name "BeLikeBee") comes from next-intl in both uk and en. New keys go under `app.home` in `src/app/messages/{uk,en}.json`, with the same keys in both files. | `src/app/i18n/messages.test.ts`, `src/app/messages/*.json` |
| BR-11 | Confirmed | The copy for the headline, lead, and rental note is the wording in section 11. | `SPEC.md` §1, user approval 2026-10-25 |
| BR-12 | Observed | Accessibility: exactly one `h1` (the headline). DOM and tab order: language switcher → primary action → session links → "Sign out". The primary action shows a visible focus ring. The backdrop is `aria-hidden`. Text meets 4.5:1 against `--background` (`wax-100`). | `button.tsx:7`, `hive-profile.tsx:14`, computed contrast |
| BR-13 | Confirmed | No hive preview. The page makes no data calls besides `getSession()`. | User answer |
| BR-14 | Observed | The existing E2E specs (`registration`, `apiaries`, `admin`, `language`) pass without edits. | `e2e/*.spec.ts` |

## 7. Routes and frames

| Surface | Route / frame | Required content and layout |
|---|---|---|
| Current | `/` | `h1` "BeLikeBee", underlined "Browse hives" link, session sentence or signed-out sentence, role link, "Sign out", stacked in the `max-w-sm` column on a white page. |
| Desktop | `1440×900`, frame `home / desktop / guest` and `home / desktop / beekeeper` | Comb backdrop fills the viewport. Content stays in the layout's centered 384 px column (layout unchanged). Order: language switcher, brand line, `h1`, lead, primary button, rental note, separator, session block. |
| Mobile | `375×667` (small phone, the binding frame for BR-02) and `375×812`, frames `home / mobile / guest`, `home / mobile / admin` | Same order, one column, `px-6`. Button width = its content (no full-bleed requirement). No horizontal scroll. |

Role specimens needed in design: guest, client, beekeeper, admin. Language specimens: uk (default) and en for the guest frame, because uk strings are longer.

## 8. State inventory

| State | Trigger | Visible result | Recovery / next action |
|---|---|---|---|
| Empty | N/A: the page shows no list data (BR-13). `/hives` owns its own empty state (`apiary.browse.empty`). | — | — |
| Loading | N/A: server-rendered; there is no Suspense boundary or client fetch on `/`. | — | — |
| Ready — guest | No session | Hero + signed-out sentence with "Sign in" / "create an account" links. | Primary button → `/hives`; links → `/sign-in`, `/sign-up`. |
| Ready — client | Session, role CLIENT | Hero + "Signed in as **email** (Client)" + "Sign out". No role link. | Primary button → `/hives`. |
| Ready — beekeeper | Session, role BEEKEEPER | Hero + signed-in text + "My apiaries" + "Sign out". | `/apiaries`. |
| Ready — admin | Session, role ADMIN | Hero + signed-in text + "Verify beekeepers" + "Sign out". | `/admin/beekeepers`. |
| Success | Click on the primary button | Navigates to `/hives`. | — |
| Error | `getSession()` or rendering throws | Next.js default error page, unchanged. | Out of scope. |
| Hover | Pointer over the primary button | `hover:bg-primary/90` (existing `Button` default variant). | — |
| Focus | Tab to the primary button | `focus-visible` ring (`ring-[3px] ring-ring/50`) visible on the wax background. | — |
| Disabled | N/A: no action on this page can be disabled. The language switcher's current language is `disabled` by existing design. | — | — |

## 9. Reuse and handoff contract

| Design responsibility | Current code owner / token | Decision |
|---|---|---|
| Page composition | `src/app/page.tsx` | extend (rewrite markup in place) |
| Outer column, language switcher | `src/app/layout.tsx`, `src/shared/i18n/language-switcher.tsx` | reuse, no change |
| Apiary colors | `.theme-apiary` in `src/app/globals.css:43-47` | reuse (class on the page wrapper) |
| Comb backdrop | markup in `src/modules/apiary/ui/hive-profile.tsx:14-16`; utilities `bg-background`, `bg-comb-cell`, `wax-foundation` | reuse the utilities; repeat the 3-line markup in `page.tsx` (see section 14) |
| Brand line "BeLikeBee" | `type-muted` | reuse |
| Headline `h1` | `type-title` | reuse |
| Lead sentence | body text (inherits `text-foreground`) | reuse |
| Primary action | `Button` (`src/shared/ui/button.tsx`), `variant="default"`, `size="lg"`, `asChild` + `next/link`; text `apiary.nav.browseHives` | reuse |
| Rental note | `type-muted`; new key `app.home.rentalNote` | reuse role; new message key |
| Section separator | `hr.w-12.border-hive-frame` (as `hive-profile.tsx:41`) | reuse |
| Session sentence, role links, sign-out | `app.home.signedInAs` / `signedOut`, `apiary.nav.myApiaries`, `identity.admin.link`, `SignOutButton` from `@/modules/identity` | reuse, unchanged behavior |
| Copy | `src/app/messages/uk.json`, `src/app/messages/en.json` under `app.home` | extend: add `title`, `lead`, `rentalNote` |
| Guest E2E for the hero | none yet | new test candidate `e2e/home.spec.ts` |

## 10. Responsive and accessibility contract

- **Responsive:** single column at every width (the layout caps it at 384 px). At 375×667 the bottom of the rental note sits at or above 667 px for a guest in uk and en. Long words wrap (`text-balance` on the headline is allowed); `Button` is `whitespace-nowrap`, so its label must fit 327 px (375 − 2×24). No horizontal scroll at 320–1440 px.
- **Keyboard:** tab order follows DOM order: language buttons → primary button → session links (sign in / create account, or role link) → "Sign out". Enter on the primary button opens `/hives`. Focus ring visible on every focusable element.
- **Semantics:** one `h1` (headline). The brand line is a `p`, not a heading. The backdrop has `aria-hidden`. The primary action is a `link` (an `<a>`), not a `button`, because it navigates. The session block keeps its current text structure; wrapping it in a `section` is allowed.
- **Contrast and motion:** body text propolis-900 on wax-100 and on comb lines ≥ 10:1; `type-muted` comb-600 on wax-100 = 5.30:1 (AA). Known risk: on the 1-px comb lines (wax-300) muted text is 4.35:1, the same as the existing hive profile; acceptable because the lines are thin and the surrounding fill is wax-100. Button label 17.16:1. No animation is added.

## 11. Content and realistic data

| Key | uk | en |
|---|---|---|
| brand (literal, not a key) | BeLikeBee | BeLikeBee |
| `app.home.title` | Орендуйте справжній вулик на пасіці | Rent a real hive at an apiary |
| `app.home.lead` | Вулик стоїть на пасіці за містом, пасічник доглядає за ним, а мед із нього наприкінці сезону — ваш. | The hive stays at a countryside apiary, a beekeeper looks after it, and its honey is yours at the end of the season. |
| `apiary.nav.browseHives` (existing) | Переглянути вулики | Browse hives |
| `app.home.rentalNote` | Оренда відкриється разом із планами. Вулики вже можна переглянути. | Renting opens together with plans. You can already look at the hives. |
| `app.home.signedOut` (existing) | Увійдіть або створіть акаунт. | Sign in or create an account. |
| `app.home.signedInAs` (existing) | Ви увійшли як **olena@example.test** (Пасічник) | Signed in as **olena@example.test** (Beekeeper) |

The en rental note deliberately avoids the words "Browse hives": `e2e/apiaries.spec.ts:38` needs exactly one *link* with that name. Plain text would not break it, but keeping the strings apart prevents confusion in `getByText` lookups.

## 12. Non-goals and forbidden changes

- No change to `src/app/layout.tsx`, `globals.css`, `src/shared/ui/*`, or any module file (`src/modules/**`), including `hive-profile.tsx`.
- No new route, API, Prisma model, migration, or event.
- No new package, font, image, or icon set; no serif on home.
- No hive preview, price, plan, or "rent" button (renting belongs to `billing`, not built).
- No change to sign-in, sign-up, sign-out, or role checks; no redirect of signed-in users away from `/`.
- No edits to existing E2E specs to make them pass.
- No change to page `<title>` or other metadata.

## 13. Design references

- Current UI evidence: route `/` as rendered by `src/app/page.tsx` at `0102f5b`; visual precedent `/hives/[id]` (`hive-profile.tsx`).
- Approved frame URLs / node IDs: N/A — code-first, no design-tool file (decision 2026-10-25).
- Repo-local design file: N/A; the frames are the `verify-ui` screenshots in `docs/design/first-screen/`.

## 14. Open decisions

| Decision | Why it matters | Owner | Due | Status |
|---|---|---|---|---|
| Copy in section 11 (title, lead, rental note, uk and en) | It is the whole "understand in seconds" message; the lead also makes a product promise (honey at season end). | Product owner | Before implementation | Confirmed (approved 2026-10-25) |
| Repeat the 3-line comb backdrop in `src/app/page.tsx` instead of extracting a shared component | Extracting would change `hive-profile.tsx` (outside this scope) and add an export to a module or `src/shared/ui`. Repeating costs 3 lines. | Frontend engineer | Before implementation | Confirmed (approved 2026-10-25) |
| Brand as a `type-muted` line above the `h1` (instead of the `h1` itself) | The `h1` must carry the value proposition for a guest; the brand moves to a smaller line. | Product owner | Before implementation | Confirmed (approved 2026-10-25) |

## 15. Spec-ready gate

- [x] Current product behavior is backed by repository evidence.
- [x] Product decisions are confirmed or visibly marked Proposed.
- [x] Requirements have stable IDs.
- [x] Desktop/mobile, states, reuse, accessibility, and non-goals are covered.
- [x] No route, dependency, component, token, or API has been invented as fact.
- [x] Every requirement maps to a DOD row in section 16 below.

---

# Definition of Done

Completion means every applicable row is checked with evidence. An agent report, generated image,
or visual impression is not evidence by itself.

## 16. Done checks

| ID | Covers | Layer | Pass condition | Evidence | Done |
|---|---|---|---|---|---|
| DOD-01 | BR-11 | Specification | Every Proposed row in section 14 is approved or replaced, and section 11 holds the final uk/en strings. | Section 11 and 14 statuses | [x] |
| DOD-02 | BR-01, BR-13 | Specification / scope | `git diff --stat` touches only `src/app/page.tsx`, `src/app/messages/uk.json`, `src/app/messages/en.json`, `e2e/home.spec.ts` (plus `docs/` and `LOG.md`). `page.tsx` still imports only `next/link`, `next-intl/server`, `@/modules/identity`, `@/shared/ui/button`, and calls no data function besides `getSession()`. | `git diff --stat`; `grep -n "import\|await" src/app/page.tsx` | [ ] |
| DOD-03 | BR-02, BR-06 | Design structure | N/A — code-first: the screen is built directly from the existing design system, without a Figma or Pencil file. The four frames of section 7 are replaced by `verify-ui` screenshots of the live page, in the order of section 7. | `docs/design/first-screen/*.png` from the `verify-ui` run (also DOD-05, DOD-09) | [ ] |
| DOD-04 | BR-05, BR-09 | Tokens and reuse | The diff adds no hex/oklch/rgb/palette-color class, no `text-[…]` size, no `font-serif`, no Alegreya import, and no change to `globals.css` or `package.json`. The page wrapper has class `theme-apiary`; the backdrop uses `bg-comb-cell wax-foundation`. | `git diff -- src/app/page.tsx \| grep -nE "#[0-9a-fA-F]{3,8}\|oklch\|text-\[\|font-serif\|alegreya"` returns nothing; `git diff --stat -- src/app/globals.css package.json pnpm-lock.yaml` empty | [ ] |
| DOD-05 | BR-02 | Responsive / live | At 375×667 and 1440×900, as a guest in uk and in en, the `h1`, the lead, the "Browse hives" link, and the rental note each have `getBoundingClientRect().bottom ≤ window.innerHeight` and `scrollWidth ≤ clientWidth` on `html`. | Browser run + DOM measurements + 4 screenshots | [ ] |
| DOD-06 | BR-03 | Behavior | On `/` there is exactly one `link` named "Browse hives" (en) / "Переглянути вулики" (uk); it has the `Button` classes (`bg-primary`, `h-10`); clicking it lands on `/hives`. | `e2e/home.spec.ts` (`toHaveCount(1)`, `toHaveURL("/hives")`); the class assertion fails against the current page before the change | [ ] |
| DOD-07 | BR-04, BR-11 | Behavior / content | The guest sees the approved `h1` text and rental note in uk and en. No text "price"/"ціна" and no button or link named "Rent"/"Орендувати" on `/`. | `e2e/home.spec.ts`; browser run | [ ] |
| DOD-08 | BR-07, BR-08, BR-14 | Behavior (preserved) | Guest, client, beekeeper, and admin each see the session block from section 8; links and sign-out behave as today; existing E2E specs pass unchanged. | `git diff --stat -- e2e/registration.spec.ts e2e/apiaries.spec.ts e2e/admin.spec.ts e2e/language.spec.ts e2e/helpers.ts` empty; `pnpm test:e2e` output | [ ] |
| DOD-09 | BR-06 | States | For every role in section 8, the hero comes before the session block in the DOM, and an `hr` separates them. | Browser run: DOM order check per role; screenshots for guest and beekeeper | [ ] |
| DOD-10 | BR-12 | Accessibility | `document.querySelectorAll("h1").length === 1`; the backdrop has `aria-hidden="true"`; Tab from page start reaches language buttons, then the primary link, then session links, then "Sign out"; the primary link shows a visible focus ring (computed `box-shadow` not `none` when focused). | Keyboard run + accessibility snapshot | [ ] |
| DOD-11 | BR-12 | Accessibility / contrast | Computed `color` vs `--background` of the theme wrapper is ≥ 4.5:1 for the brand line, lead, rental note, and session text. | Computed styles + contrast calculation recorded in the verify report | [ ] |
| DOD-12 | BR-10 | Deterministic gates | `pnpm test` passes, including `messages.test.ts` (uk/en key parity); `pnpm typecheck` and `pnpm build` pass. | Command output | [ ] |
| DOD-13 | BR-03, BR-07, BR-08, BR-14 | Deterministic gates | `pnpm test:e2e` passes (all specs, including the new `e2e/home.spec.ts`), run outside the sandbox with Postgres up. | Command output | [ ] |
| DOD-14 | BR-02, BR-03, BR-04, BR-05, BR-06, BR-07, BR-08, BR-12 | Live evidence | `verify-ui` reports PASS for DOD-05, -06, -07, -09, -10, -11 with expected vs actual evidence and screenshots. | `verify-ui` report + screenshots | [ ] |

## 17. Requirement coverage

| Requirement | Covered by DoD IDs | Gap |
|---|---|---|
| BR-01 | DOD-02 | none |
| BR-02 | DOD-03, DOD-05, DOD-14 | none |
| BR-03 | DOD-06, DOD-13, DOD-14 | none |
| BR-04 | DOD-07, DOD-14 | none |
| BR-05 | DOD-04, DOD-14 | none |
| BR-06 | DOD-03, DOD-09, DOD-14 | none |
| BR-07 | DOD-08, DOD-13, DOD-14 | none |
| BR-08 | DOD-08, DOD-13, DOD-14 | none |
| BR-09 | DOD-04 | none |
| BR-10 | DOD-12 | none |
| BR-11 | DOD-01, DOD-07 | none |
| BR-12 | DOD-10, DOD-11, DOD-14 | none |
| BR-13 | DOD-02 | none |
| BR-14 | DOD-08, DOD-13 | none |

## 18. Final gate

- [ ] Every requirement is covered by at least one DoD row.
- [ ] Every applicable DoD row is checked and links to evidence.
- [x] Every `Proposed` decision (section 14) was approved or removed before implementation.
- [ ] Deterministic checks and live browser verification both passed.
- [ ] The final repository diff matches the approved scope.
