---
status: Confirmed
owner: "ivan lysakov"
reviewers: []
updated_at: "2026-10-27"
feature_size: TBD     # set by sdlc:classify-size, not here
stage: "01"
depth: medium
ticket: "none"
value_score:
  rice: 5.6
  state: confirmed
  confirmed_at: "2026-10-27"
feasibility_state: confirmed
---

<!-- Stage 01 → see .claude/skills/interview/SKILL.md -->
<!-- Why: capture the idea before it's forgotten or retold incorrectly -->

# Idea Brief — Hive rental

## 1. Raw idea

> «Міський житель обирає справжній вулик на пасіці за містом і тариф, платить наперед і стає «власником» цього вулика на сезон — а бджоляр отримує гроші до сезону, коли їх найбільше бракує.»

(A city resident picks a real hive at a countryside apiary and a plan, pays up front and becomes the "owner" of this hive for the season, and the beekeeper gets money before the season, when it is most lacking.)

## 2. Problem

City residents want a real link to nature and traceable honey but have no space, time or skills to keep bees. Independent beekeepers carry their highest costs in spring, before any honey is sold, and have few sales channels. BeLikeBee already lists hives publicly, but a client cannot rent or pay for one, so neither side gets value yet. How people do this in Ukraine today is unknown: no Ukrainian hive-rental or adopt-a-hive service was found (§6).

## 3. Users

- **Clients (B2C):** urban professionals, eco-conscious families, gift buyers. One rental per client per season; buying happens once a year, before the season.
- **Beekeepers (B2B):** independent, admin-verified, each listing a few hives. They need pre-season cash.
- **Admin:** creates the plans clients choose from.
- Both sides matter equally for v1. First-season target: 10 clients and about 5 beekeepers.

## 4. Why now

This is a capstone project, so the course deadline sets the timing, not a market event. Hive rental is the core flow every later feature depends on (hive feed, visits, honey reservation), and the parts it builds on are done: accounts, verified beekeepers, apiaries, hives with photos, public hive pages.

## 5. Out of scope

- Automatic subscription renewal: v1 is one payment per season.
- Honey reservation at season end.
- Refunds.
- Several clients sharing one hive: a hive rental is exclusive.
- Real money: payments run in Monobank test mode only.
- In-season promise list and photo tick-offs (Approach B): parked, see §14.

## 6. Competitive analysis

| # | Product · URL | Features | Value per feature (1-5) | Gap |
|---|---|---|---|---|
| 1 | 3Bee (Italy) · [3bee.com](https://www.3bee.com/en/adopt-a-beehive/) | Adopt a hive for a year; photos and video in an app; honey delivery by plan; from €12/year | Follow-a-hive 5 · honey 4 · gift 4 | Not in Ukraine; the experience depends on sensors on every hive |
| 2 | Pollenity (Bulgaria) · [pollenity.com](https://pollenity.com/adopt-a-hive/) | Monthly subscription; adoption certificate; name the queen; personal labels | Certificate 4 · naming 5 · monthly honey 3 | No choice of a specific beekeeper; no Ukrainian market |
| 3 | Hunajalähde (Finland) · [hunajalahde.com](https://www.hunajalahde.com/WORKER-BEE-beehive-adoption) | Fixed-term adoption; €69 for 1.5 kg honey with personal labels; autumn delivery | Honey 4 · labels 3 | Videos only in Finnish; one apiary, not a marketplace |
| 4 | Bees & Co (UK) · [beesforbusiness.com](https://shop.beesforbusiness.com/collections/gifts1/products/bees-co-adopt-a-beehive-gift-set/) | £39–64 gift set; quarterly email updates; certificate; honey from the adopted hive | Gift 5 · updates 2 · honey 4 | Updates only quarterly; gift-only product |
| 5 | Honeyshare (US) · [thebeepartner.com](https://www.thebeepartner.com/honeyshare) | Fractional hive shares from ¼; yearly honey shipping | Shares 4 · honey 4 | Shared hives, not one client per hive |
| 6 | Ukrainian market · e.g. [Медик Ведмедик «Медовий вулик»](https://www.medyk-vedmedyk.ua/podarunkovi-nabori/podarunkoviy-nabir-10/) | Honey gift sets (4 × 250 g, custom lid); no hive rental | Gift 3 · traceability 1 | No "your own hive" service at all; the model is mentioned only in [one interview](https://yuzhne.city/articles/136614/yak-z-odnogo-vulika-virosla-simejna-sprava) |

Footnotes: all rows searched 2026-10-27. Rows 1–5: query "adopt a beehive subscription honey from your own hive". Row 6: queries «оренда вулика мед з власного вулика пасіка» and «усиновити вулик подарунок мед Україна».

## 7. Strategic approaches

### Approach A — One Plan, One Season Rental
- **Thesis:** One season plan and one up-front payment turn a hive from "available" into "rented" until season end; nothing else.
- **For whom:** clients who want one clear price; beekeepers needing confirmed pre-season money.
- **Outcome metric:** paid hive rentals in the first season, 0 → 10.
- **Key trade-off:** no tiers, naming or gifting; beekeeper payouts tracked by hand.
- **Effort signal:** S
- **Recommended?** ◯

### Approach B — Named Hive, Funded Season
- **Thesis:** The client names the hive, and the beekeeper's public season promise list shows what the up-front money bought.
- **For whom:** gift buyers and families paying for a story; beekeepers gaining visible trust.
- **Outcome metric:** paid rentals 0 → 10, at least 3 as gifts.
- **Key trade-off:** weekly beekeeper work all season; a longer checkout.
- **Effort signal:** M
- **Recommended?** ◯

### Approach C — Name Your Hive
- **Thesis:** Checkout as short as A plus one emotional moment: the client names the hive, can gift it, and gets a shareable rental certificate.
- **For whom:** gift buyers and families; beekeepers get A's up-front money plus a running total.
- **Outcome metric:** paid hive rentals in the first season, 0 → 10.
- **Key trade-off:** 1–2 weeks more than A; no in-season updates.
- **Effort signal:** M
- **Recommended?** ●

## 8. Multi-perspective feedback

### Engineer
- A has the fewest moving parts, but every approach must hold a hive during checkout so two clients can't pay for it.
- "Rented until season end" needs a rule that frees the hive again.
- B hides a second, season-long feature (promise tracking with photos) that a demo can't show.
- In C, a failed beekeeper notice must never undo a payment; the running total counts confirmed payments only.
- Gifts (B, C) blur who holds the rental; a public certificate can leak personal details.

### Executive
- A ships fastest but gives no emotional reason to pay, so it competes on honey price.
- B builds trust, but its value lands after the deadline, and "funded" sounds like a donation.
- C's naming, gifting and certificate are what sell adopt-a-hive abroad; no one offers them in Ukraine.
- C's shared certificate is free reach; nothing runs in-season, so schedule risk is low.

### UX-researcher
- A has the least friction but months of silence after paying ("is my hive real?").
- B has the best trust signal, the longest checkout and the heaviest beekeeper load; a missed tick is a public broken promise.
- C keeps the core path fast; gift and certificate fit how people buy presents.
- Keep rented hives listed with a "rented" badge as proof that others rent; "ownership" overpromises; public names need an opt-out.

### Synthesis matrix

|         | Engineer | Executive | UX |
|---------|:--------:|:---------:|:--:|
| App. A  | + smallest surface, fastest to ten | 0 ships fast, no reason to choose | 0 fast checkout, silent after payment |
| App. B  | − season-long scope, value shows later | 0 right idea, pays off post-deadline | 0 best trust, beekeeper load heavy |
| App. C  | 0 good core, cut gifts first | + proven appeal, gift channel, both sides | + serves gift buyers, light beekeepers |

## 9. Trade-offs and edge cases

### Trade-offs per approach

| Approach | Pros | Cons |
|---|---|---|
| A | Fastest; fewest parts; least beekeeper work | No reason to choose us; no gift channel; silence after payment |
| B | Strongest trust; beekeeper accountability is visible | Value arrives after the deadline; heavy beekeeper load; "funded" blurs the quota |
| C | Proven abroad; gift channel; light for beekeepers | 1–2 weeks more than A; still silent during the season; gift ownership unclear |

### Edge cases

- Two clients pay for the same hive at once: one rental results; the other sees the hive is taken.
- The bank confirms a payment twice: the rental activates once.
- Checkout is abandoned or the payment fails: the hive is available again.
- The season ends: the rental ends and the hive is free for the next season.
- A gift: payer and rental holder are different people.
- Public hive or renter names: length limits, moderation, opt-out.
- The beekeeper notice fails: the paid rental stands regardless.
- The colony dies or swarms mid-season: no rule yet for swapping hives.

## 10. Risks

- **Top attack vector (devil's advocate):** the honey quota is guaranteed regardless of the harvest. In a bad year (drought, frost, regional disease) beekeepers owe honey their hives never made, and nobody is defined to cover it. Signals: beekeepers quitting in one season, missed deliveries, chargebacks, "not my hive's honey" reviews.
- A beekeeper drops out mid-season (mobilisation, shelling, illness) while refunds are out of scope.
- Money holding: paid up front, beekeepers have less reason to keep caring; held until autumn, they wait months and leave.
- Fraud: the same hive sold offline, a hive that doesn't exist, reused photos.
- Legal and tax: receipts for prepayment, food safety documents, an unclear legal seller.
- Short seasonal sales window: too few hives sell out, too many unsold hives drive beekeepers away.

## 11. RICE — Claude proposed

- **Reach (R)**: 15 — 10 clients from the first-season metric plus about 5 beekeepers whose hives they rent (§3 Users).
- **Impact (I)**: 3 — without rental the product earns nothing and beekeepers get no pre-season cash, the core promise named in the Executive view (§2, §8).
- **Confidence (C)**: 0.5 — three big unknowns stay open: who covers a quota shortfall, who holds the money, and whether there is demand in Ukraine (§15).
- **Effort (E)**: 4 person-weeks — Approach C is effort M (§7).
- **RICE = R × I × C / E = 15 × 3 × 0.5 / 4 ≈ 5.6**
- **State**: confirmed

## 12. Feasibility — Claude proposed

- [☐] **Tech**: hives, photos and the public hive page already exist in the apiary module (`src/modules/apiary/`, `/hives/[id]`), and so does the event bus (`src/shared/event-bus.ts`). But this is the first outside payment integration: billing has only a README, hives have no "rented" state, and Monobank test access is unchecked. ☐ until a test payment goes through.
- [☑] **Skills**: seven features in identity and apiary shipped between 2026-10-22 and 2026-10-25, each with unit, integration and end-to-end tests (`LOG.md`); rental repeats the same form, action and test pattern, and only bank payment confirmation is new.
- [☑] **Time**: comparable features took 9–58 minutes from first prompt to green tests (`LOG.md`, F1 and F2); rental is a few such slices plus the payment integration. The capstone defence date is not recorded (§15).
- **State**: confirmed

## 13. Recommendation

**Selected: Approach C — Name Your Hive**, with two changes from review: rented hives stay in the list with a "rented" badge (UX), and the gift option and certificate are the first things cut if time runs short (Engineer).

C keeps checkout as short as A and adds what sells adopt-a-hive abroad, naming plus a gift certificate, which has no Ukrainian equivalent (§6: Pollenity and Bees & Co sell through certificates; Ukraine has only honey gift sets). Two of three reviewers rated it "+": Executive for "proven appeal, gift channel, both sides" and UX for "serves gift buyers, light beekeepers" (§8). RICE is 5.6 at effort M with low confidence (§11), which is honest for a capstone without real customers. Feasibility is confirmed with Skills ☑ and Time ☑ but **Tech ☐** (§12): the recommendation carries a warning that the payment path is unproven, so the first PRD step is getting a test payment through.

**Locked-in pointer**: write-prd covers hive and plan choice on the hive page, one test-mode payment, the "rented" badge, naming, the beekeeper notice and running total; gift and certificate are the first slice to cut.

## 14. Parked & rejected approaches

| # | Approach | Status | Reason | Revisit trigger |
|---|---|:---:|---|---|
| A | One Plan, One Season Rental | parked | No emotional reason to buy and no gift channel (Executive 0, UX 0) | The payment integration takes longer than planned, or the deadline tightens |
| B | Named Hive, Funded Season | parked | Value appears during the season, after the deadline; heavy beekeeper load (Engineer −) | After the first real season, as part of a hive feed feature |
| - | Real-money payments | parked | Capstone project; needs a merchant account and beekeeper contracts | A decision to launch with real clients |

## 15. Open questions

Owner of all: ivan lysakov.

- [ ] Who covers a honey quota shortfall in a bad year: beekeeper, platform, or other hives? — due: before write-prd
- [ ] Who holds the client's money until autumn: the beekeeper or the platform? — due: before write-prd
- [ ] What happens if the colony dies or swarms, or the beekeeper drops out mid-season? — due: before write-prd
- [ ] What is the capstone defence date? — due: before write-prd
- [ ] With a gift, who holds the hive rental: payer or recipient? — due: write-prd
- [ ] Is the renter's name public, with an opt-out? — due: write-prd
- [ ] The raw idea says "owner", but a hive rental is a claim, not ownership; call it a "season rental certificate"? — due: write-prd
- [ ] A hive rental ends on "suspended or cancelled", but cancellation is undefined. — due: write-prd
- [ ] Is "tariff" a synonym of "plan" (SPEC.md: "plans and tariffs")? — due: write-prd
- [ ] Is test merchant access to Monobank available? — due: first PRD step
- [ ] Is there demand in Ukraine? No local equivalent found (§6). — due: after launch

## Related

- Glossary: [docs/features/CONTEXT.md](../CONTEXT.md) (hive rental, subscription, plan, honey quota, season)
- Product: [README.md](../../../README.md), [SPEC.md](../../../SPEC.md) UC-1
- Context boundaries: [docs/bc-map.md](../../bc-map.md), [src/modules/billing/README.md](../../../src/modules/billing/README.md)
- Ticket: none

## DoD self-check

- [x] 15 sections present
- [x] No anti-pattern terms
- [x] Length ≤ 5 pages (~2200 words)
- [x] Frontmatter status: Confirmed
- [x] RICE confirmed (state: confirmed)
- [x] Feasibility confirmed (state: confirmed)
- [x] Recommendation present with rationale citing 4 upstream sections (§6, §8, §11, §12)
