---
status: Living
updated_at: "2026-10-27"
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
- hive rental (UI: «оренда вулика») — a client's exclusive claim on one specific hive for as long as their subscription is active: it starts when the subscription is activated and ends when it is suspended or cancelled. NOT a physical lease (the client never takes the hive or equipment away; it stays at the apiary and the beekeeper keeps caring for it).
- honey quota (UI: «квота меду») — the weight of raw honey, set by the client's plan, that the client is guaranteed to receive at season end regardless of how much their hive actually produces. NOT harvest (the harvest is all the honey a hive actually produces in a season; it does not change the quota).
- honey reservation (UI: «резервування меду») — the client's confirmation, near season end, that they will take their honey quota, after which that weight of honey is set aside for them. NOT honey quota (the quota is the weight the client is entitled to; the reservation is the client's act of claiming it).
- plan (UI: «план») — a catalogue offer managed by the admin that sets the price per billing period and what the client gets for it (e.g. included visits, a honey quota), such as Basic or Premium + Honey. NOT subscription (a plan is the same offer for every client; a subscription is one client's agreement on one plan).
- season (UI: «сезон») — the period, with start and end dates set by the beekeeper for their apiary each year, for which a hive is rented and after which the honey quota is due. NOT calendar year (a season covers only the active beekeeping months, and its dates differ between apiaries).
- subscription (UI: «підписка») — a client's paid agreement on a chosen plan, renewed and charged each billing period, which stays active while payments succeed and is suspended after repeated failed payments. NOT plan (a plan is the offer in the catalogue, e.g. Basic or Premium + Honey; a subscription is one client's agreement on one plan).
- work order (UI: «завдання пасічнику») — a client's request for one specific task on their rented hive (e.g. an extra inspection or a photo of a frame), which the beekeeper accepts or declines and, once done, reports with a hive log entry. NOT hive log entry (the work order is what the client asks for; the hive log entry is the beekeeper's report of what was done, with or without a work order).
