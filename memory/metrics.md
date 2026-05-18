# Metrics — Running Totals

> Update at end of every session that touches outreach, content, or product. Source of truth for "are we winning."

## InspectIQ — North Star

**Goal:** 40 paying customers ($3,960 MRR) by August 1, 2026.

| Date | Paying customers | MRR | Trial signups (cumulative) | Notes |
|---|---|---|---|---|
| 2026-05-03 | 0 | $0 | 0 | Sprint started. Reset baseline. |
| 2026-05-07 | 0 | $0 | **1** | 🎉 **FIRST TRIAL SIGNUP — Julio Paredes (TX).** Cold email reply → TREC 7-6 question → built TREC 7-6 same day → reply yes → trial signup. End-to-end funnel validated. Trial ends May 21, conversion decision May 22. |

## Cold email — by campaign

### Prior campaigns (already executed)

| Campaign | Sends | Tool | Result |
|---|---|---|---|
| PA original | ~9 (CSV emails) | send_emails.py / personal Gmail | 0 paying conversions |
| PA resend | 103 | Cowork scheduled task | 0 paying conversions |
| Ohio | 160 | Cowork scheduled task | 0 paying conversions |
| **Total** | **~261 unique** | | **0** |

Reasons for 0 conversion documented in `memory/cold_email.md`. Generic emails, no sequence, personal Gmail, no warmup.

### v1 sequence — live results (May 5 onward)

| Date | Sends today | Cumulative | Replies | Unsubs | Bounces | Notes |
|---|---|---|---|---|---|---|
| 2026-05-05 | 115 | 115 | 0 | 1 (Ramon Rivera, NPI) | 0 | Manual + autonomous launch day. Spectora-naming copy fixed mid-day. |
| 2026-05-06 | 100 | 215 | 0 | 0 | 0 | Fully autonomous via launchd. |
| 2026-05-07 | 105 | 320 | **1 — Julio Paredes (TX)** | 0 | 0 | Julio asked "does your software have a built-in TREC 7-6 template?" → replied yes after Claude Code shipped TREC 7-6 template same day. |

### Replies / Engagements log

| Date | Name | Email | State | What they asked | How we responded | Status |
|---|---|---|---|---|---|---|
| 2026-05-07 | Julio Paredes | j.titan2023@gmail.com | TX | "Hi, does your software have a built-in TREC 7-6 template?" | "Yes — under Templates after sign-in" + trial link, sent ~2 hr after his reply | ✅ **STARTED TRIAL May 7** — first real trial signup of the campaign. Trial ends May 21, conversion decision May 22. |

### v1 sequence (planned targets)

| Metric | Current | Target |
|---|---|---|
| Daily sends | 0 | 500/day by week 2 |
| Open rate | — | >40% |
| Reply rate | — | >3% |
| Click rate | — | >2% |
| Trial start (clicks → trial) | — | >30% |
| Trial-to-paid | — | >20% |

## Lead pipeline

| Source | Total leads | With email | Already contacted | Available to contact |
|---|---|---|---|---|
| PA NACHI scrape (existing CSV) | 955 | 9 | 9 (estimated) | 946 (need email enrichment) |
| OH (Cowork list) | 160 | 160 | 160 | 0 |
| PA resend list | 103 | 103 | 103 | 0 |
| Other 48 states | 0 | 0 | 0 | TBD via Lead Generator |

## SEO content

| Date | Posts published | Indexed | Top organic kw |
|---|---|---|---|
| 2026-05-03 | 0 | 0 | — |

## Customer success

| Date | Trials active | Trial-to-paid % | Churn % | Median support response |
|---|---|---|---|---|
| 2026-05-03 | 0 | — | — | — |

---

**Update protocol:** at end of any session where any metric changed, append a new row dated today. Don't overwrite history — append. We need to see the trajectory.
