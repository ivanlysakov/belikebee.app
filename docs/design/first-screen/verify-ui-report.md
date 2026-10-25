# home · verify-ui

- **Date:** 2026-10-25
- **Server:** `next dev` at `http://localhost:3200` (dev database `belikebee`)
- **Tool:** `playwright-cli` 0.1.22, Chromium; language set with the `NEXT_LOCALE` cookie
- **Spec:** `docs/design/design-spec.md` §16
- **Code under test:** `src/app/page.tsx`, `src/app/messages/{uk,en}.json` (uncommitted, on top of `75498f3`)
- **Test users** (created through `/sign-up` in the dev database; the admin was promoted with `pnpm admin:promote`):
  `verify-ui-client-c55d1cc1@example.test`, `verify-ui-beekeeper-c55d1cc1@example.test`, `verify-ui-admin-c55d1cc1@example.test`

## Verdict

```
home · verify-ui
  DOD-05  PASS — 375×667 and 1440×900, uk and en: h1, lead, primary link, rental note all have bottom ≤ innerHeight; html scrollWidth = clientWidth
  DOD-06  PASS — exactly 1 link "Browse hives" / "Переглянути вулики", href /hives, classes bg-primary and h-10; click lands on /hives (uk, en)
  DOD-07  PASS — approved h1 and rental note in uk and en; no "price"/"ціна" text; no link or button named Rent/Орендувати
  DOD-09  PASS — guest, client, beekeeper, admin: hero is the first section and precedes the session section; hr is the session section's first child
  DOD-10  PASS — 1 h1; backdrop aria-hidden="true"; Tab order language → primary → session links → Sign out for every role; primary link box-shadow has the 3px ring when focused
  DOD-11  PASS — vs --background rgb(242,231,196): brand 5.29:1, lead 12.18:1, rental note 5.29:1, session text 12.18:1 (guest and every signed-in role)
  DOD-14  PASS — DOD-05, -06, -07, -09, -10, -11 all PASS with evidence below
Summary: PASS (7/7).
```

## Evidence

### DOD-05 — first viewport, no horizontal scroll

`getBoundingClientRect().bottom` (px), guest:

| Language | Viewport | h1 | lead | primary link | rental note | `scrollWidth` / `clientWidth` |
|---|---|---|---|---|---|---|
| uk | 375×667 | 200 | 288 | 344 | 392 | 375 / 375 |
| uk | 1440×900 | 200 | 288 | 344 | 392 | 1440 / 1440 |
| en | 375×667 | 168 | 256 | 312 | 360 | 375 / 375 |
| en | 1440×900 | 168 | 256 | 312 | 360 | 1440 / 1440 |

Screenshots: `home-guest-uk-375.png`, `home-guest-uk-1440.png`, `home-guest-en-375.png`, `home-guest-en-1440.png`.

### DOD-06, DOD-07 — primary action and content (guest, live)

| Check | en | uk |
|---|---|---|
| Links named "Browse hives" / "Переглянути вулики" | 1 | 1 |
| `href` | `/hives` | `/hives` |
| `bg-primary`, `h-10` | true, true | true, true |
| `location.pathname` after click | `/hives` | `/hives` |
| `h1` | Rent a real hive at an apiary | Орендуйте справжній вулик на пасіці |
| Rental note | Renting opens together with plans. You can already look at the hives. | Оренда відкриється разом із планами. Вулики вже можна переглянути. |
| `/price\|ціна/i` in body text | false | false |
| Link or button named Rent / Орендувати | false | false |

### DOD-09 — hero before the session block, per role

| Role | sections | hero first | hero before session | `hr` first in session | Session controls |
|---|---|---|---|---|---|
| guest | 2 | true | true | true | Sign in, create an account |
| client | 2 | true | true | true | Sign out |
| beekeeper | 2 | true | true | true | My apiaries, Sign out |
| admin | 2 | true | true | true | Verify beekeepers, Sign out |

Screenshots: `home-guest-en-1440.png` (desktop / guest), `home-beekeeper-en-1440.png` (desktop / beekeeper), `home-guest-uk-375.png` (mobile / guest), `home-admin-en-375.png` (mobile / admin).

### DOD-10 — accessibility

- `document.querySelectorAll("h1").length` = 1 for every role.
- Backdrop `.theme-apiary > div.fixed` has `aria-hidden="true"`.
- Tab from page start (`document.activeElement` after each Tab; the current language button is `disabled`, so it is skipped):
  - guest: Українська → Browse hives → Sign in → create an account
  - client: Українська → Browse hives → Sign out
  - beekeeper: Українська → Browse hives → My apiaries → Sign out
  - admin: Українська → Browse hives → Verify beekeepers → Sign out
- Primary link focused with the keyboard: `:focus-visible` true; computed `box-shadow` includes `oklab(0.708 0 0 / 0.5) 0px 0px 0px 3px`. Screenshot: `home-guest-en-1440-focus.png`.

### DOD-11 — contrast

Computed colors converted to sRGB through a canvas; WCAG 2 relative luminance. Background = `--background` on `.theme-apiary` (the backdrop's computed `background-color` resolves to the same rgb).

| Text | Color (sRGB) | Ratio vs rgb(242,231,196) | ≥ 4.5 |
|---|---|---|---|
| Brand line (`type-muted`) | rgb(117,88,58) | 5.29 | yes |
| Lead | rgb(51,35,26) | 12.18 | yes |
| Rental note (`type-muted`) | rgb(117,88,58) | 5.29 | yes |
| Session text — guest, client, beekeeper, admin | rgb(51,35,26) | 12.18 | yes |

## Observations (outside the pass conditions)

- Session links and the language button have no `box-shadow` ring; they show the browser's default `outline: auto` on keyboard focus.
- The only console error is a 404 for `/favicon.ico`, which is not part of this page.
- The dark "N" button at the bottom left of the screenshots is the Next.js dev-tools indicator (dev server only). It comes after "Sign out" in tab order.
