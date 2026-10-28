---
status: Living
updated_at: "2026-10-28"
---

# Domain Context — BeLikeBee

<!--
CONTEXT.md is the domain glossary — not a PRD and not a scratch pad. NO implementation
detail here (no datastore/broker/framework names, no API contracts) — only domain words
and the boundaries between them. Implementation choices live in the SAD and ADRs;
behaviour lives in PRD.md.

Multi-context repos: each bounded context has its own CONTEXT.md at its root path
(registered in CONTEXT-MAP.md). System-wide terms that span all contexts live in the
repo-root CONTEXT.md. Never duplicate a term across files — pick one owner.

Terms get fixed inline, the moment they surface in an interview / PRD / review — never
batched «I'll consolidate later». Empty H2 → prune before commit; keep only the sections
that carry real content. ## Glossary is mandatory; the other two are optional.
-->

## Glossary

<!-- One line per term: name · one-sentence canonical definition · one-sentence boundary
     (what it is NOT / the concept it gets confused with). Alphabetical once there are a few. -->
- admin (UI: «адміністратор») — a platform operator who verifies beekeepers and manages the plan catalogue. NOT beekeeper (an admin runs the platform and owns no apiaries or hives).
- beekeeper (UI: «пасічник») — an apiary owner, verified by an admin, who lists hives for rent and keeps caring for them. NOT client (the beekeeper is paid for a hive rental; the client pays for it).
- checkout hold (UI: «очікує оплати») — a short, unpaid claim on a hive for the client who has started paying for it, during which no other client can start paying for the same hive; it lapses if the payment fails or is not completed in time, and becomes a hive rental once the payment is confirmed. NOT hive rental (a hold is unpaid and lapses on its own) and NOT honey reservation (which concerns honey at season end, not a hive).
- client (UI: «клієнт») — a person with an account who chooses a plan, pays for it, and holds a hive rental. NOT visitor (a visitor has no account and can only browse public pages).
- hive nickname (UI: «ім'я вулика») — the name a client gives their rented hive for the duration of one hive rental, shown publicly next to the hive's "rented" badge. NOT hive name (UI: «назва вулика»; set by the beekeeper when adding the hive, and it stays the same from one rental to the next).
- hive rental (UI: «оренда вулика») — a client's exclusive claim on one specific hive for one season: it starts when the subscription is activated and ends at season end, or earlier if the subscription is suspended or cancelled. NOT a physical lease and NOT ownership (the client never takes or owns the hive or its colony; it stays at the apiary and the beekeeper keeps caring for it).
- honey quota (UI: «квота меду») — the weight of raw honey, set by the client's plan, that the client is guaranteed to receive at season end regardless of how much their hive actually produces. NOT harvest (the harvest is all the honey a hive actually produces in a season; it does not change the quota).
- honey reservation (UI: «резервування меду») — the client's confirmation, near season end, that they will take their honey quota, after which that weight of honey is set aside for them. NOT honey quota (the quota is the weight the client is entitled to; the reservation is the client's act of claiming it).
- plan (UI: «план») — a catalogue offer managed by the admin that sets the price per billing period and what the client gets for it (e.g. included visits, a honey quota), such as Basic or Premium + Honey; older docs also call it a tariff («тариф»), which means the same thing. NOT subscription (a plan is the same offer for every client; a subscription is one client's agreement on one plan).
- season (UI: «сезон») — the period, with start and end dates set by the beekeeper for their apiary each year, for which a hive is rented and after which the honey quota is due. NOT calendar year (a season covers only the active beekeeping months, and its dates differ between apiaries).
- season revenue (UI: «зібрано за сезон») — the sum of confirmed payments for hive rentals on the hives of one beekeeper's apiary in one season of that apiary (a beekeeper with several apiaries has one season revenue per apiary season). NOT payout (UI: «виплата»; the money actually transferred to the beekeeper outside the product).
- subscription (UI: «підписка») — a client's paid agreement on a chosen plan, charged per billing period set by the plan: it is active while its current period is paid, ends when its last paid period runs out without renewal, and is suspended after repeated failed renewal payments; a season plan has one billing period equal to the season and is not renewed. NOT plan (a plan is the offer in the catalogue, e.g. Basic or Premium + Honey; a subscription is one client's agreement on one plan).
- visitor (UI: «відвідувач») — anyone browsing the public pages without signing in. NOT client (a visitor has no account and cannot rent); not an access role either: the roles are only client, beekeeper, and admin.
- work order (UI: «завдання пасічнику») — a client's request for one specific task on their rented hive (e.g. an extra inspection or a photo of a frame), which the beekeeper accepts or declines and, once done, reports with a hive log entry. NOT hive log entry (the work order is what the client asks for; the hive log entry is the beekeeper's report of what was done, with or without a work order).
