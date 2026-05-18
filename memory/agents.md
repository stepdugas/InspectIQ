# AI Workforce — Agent Definitions

The "AI employees" running InspectIQ growth. Each agent is a defined job: schedule, inputs, outputs, success criteria. Read this before running any of them, or before designing a new one.

## Status overview

| Agent | Status | Schedule | Owner |
|---|---|---|---|
| **Lead Generator** | **v1 shipped (May 3, 2026)** — code at `~/Documents/inspectiq-outreach/lead_generator.py`. Any-state NACHI scraper. | **Daily at 7pm ET** (cron `0 19 * * *`) — Stephanie chose May 4 | Claude |
| **Outbound Writer** | **v1 shipped (May 3, 2026)** — code at `~/Documents/inspectiq-outreach/cold_sender.py`. **DAILY_LIMIT bumped 30→100 on May 4.** | **Weekdays at 7am ET** (cron `0 7 * * 1-5`) — Stephanie chose May 4 | Claude |
| **PA Email Enricher** | **v1 shipped (May 3, 2026)** — code at `~/Documents/inspectiq-outreach/enrich_pa.py`. Tested at 10% yield on sample of 10. | One-shot, run as needed | Claude |
| Content Engine | Not started — blocked by absence of blog route in Next.js app (Task #13) | Daily 9am | Claude |
| Customer Success | Not started — best built once first trial signups exist (currently 0 customers) | Continuous (responds to triggers) | Claude |

## Lead Generator v1 — current state (shipped May 3, 2026)

**Location:** `/Users/stephaniedugas/Documents/inspectiq-outreach/lead_generator.py`

**What it does:** Scrapes NACHI's certified inspector directory for any US state. Three-step lookup per inspector matching how a human would do it: (1) NACHI listing pages → profile URLs, (2) profile page → name/business/city/phone/website + email-if-listed, (3) if no email on profile, visit business website and check homepage + /contact + /about pages for contact email.

**Auto-excludes addresses already in `~/Documents/inspectiq/memory/do_not_email.txt`** so we never re-scrape someone we've already contacted.

**CLI:**
```
python3 lead_generator.py --state texas
python3 lead_generator.py --state "north carolina"
python3 lead_generator.py --state TX
python3 lead_generator.py --state florida --limit 50          # test run
python3 lead_generator.py --state georgia --no-website-fetch  # faster, less email yield
```

**Requirements:**
- Playwright: `pip3 install playwright --break-system-packages && playwright install chromium`

**Output:** `<state-slug>_inspectors.csv` (e.g. `texas_inspectors.csv`) with same columns as PA CSV. Feed directly into cold_sender:
```
python3 cold_sender.py import texas_inspectors.csv --state TX
```

**Tested:** State resolution accepts full name, slug, abbreviation, in any case. Syntax verified.

**Untouched states by previous campaigns** (good targets to start with):
- TX, FL, CA, NY, GA, NC, IL, MI, NJ — high inspector populations
- All other 48 states except OH and PA

## Outbound Writer v1 — current state (shipped May 3, 2026)

**Location:** `/Users/stephaniedugas/Documents/inspectiq-outreach/cold_sender.py`

**What it does:** 5-email sequence over 30 days, fully personalized (first_name, business, state, city), SQLite-tracked, sends via Gmail SMTP with stepdugas@gmail.com as sender + stephanie@useinspectiq.com as Reply-To.

**Schedule per lead:**
- Day 0: Email 1 (intro — small biz family story)
- Day 3: Email 2 (bump)
- Day 7: Email 3 (specific angle — question about hours)
- Day 12: Email 4 (soft close)
- Day 30: Email 5 (reactivator)

**CLI:**
```
python cold_sender.py init                           # create DB
python cold_sender.py import <csv> --state PA        # load leads
python cold_sender.py exclude <do_not_email.txt>     # exclude already-contacted
python cold_sender.py status                         # show stats + queue
python cold_sender.py preview --limit 3              # dry run
python cold_sender.py send --limit 5                 # actually send 5
python cold_sender.py mark-replied <email>           # stop sequence
python cold_sender.py unsubscribe <email>            # stop + flag
```

**Config (env vars + constants in file):**
- `GMAIL_APP_PASSWORD` env var: required to send (Stephanie generates at https://myaccount.google.com/apppasswords)
- `COLD_SENDER_DB` env var: optional override of DB path (default: cold_sender.db next to script)
- `DAILY_LIMIT = 30` (constant in file): bump to 50 after week 1, 100 after week 3
- `DELAY_BETWEEN_SENDS_S = 90`: Gmail-safe rate limit
- `PHYSICAL_ADDRESS = "Erie, Pennsylvania"`: CAN-SPAM placeholder; update with real street address before scaling

**Tested:** end-to-end on May 3, 2026 — imports the 159-row PA CSV cleanly, applies 261-email exclusion list, generates personalized previews with correct first names + subjects.

**Known limits / future work:**
- Reply detection is manual (mark-replied CLI). Future: IMAP scan for replies and auto-stop.
- No HTML body — plain text only. Add HTML when needed for click tracking.
- Subject line randomization is purely random; future: track which subjects work best per step and weight selection.
- No bounce handling. Future: detect bounces from Gmail bounce notifications and mark dead.
- Single-inbox sending. Future: rotate across multiple inboxes once volume justifies (>200/day).

---

## 1. Lead Generator

**Purpose:** Pull fresh home inspector contact info into the master Google Sheet daily.

**Schedule:** Every weekday at 6am Eastern.

**Inputs:**
- Master Google Sheet (or Drizzle-backed table — TBD)
- `memory/do_not_email.txt` (skip these addresses)
- State licensing board URLs (configured per-state)

**Process:**
1. Pick the day's target state (round-robin through all 50, but skip PA and OH for first cycle since most-contacted addresses there are already emailed).
2. Scrape that state's licensing board for licensed home inspectors.
3. For each inspector: extract name, business name, email if present, phone, license #, license date, city, state.
4. Visit business website if present; check for "Our Team" / "Inspectors" page → if multiple inspectors listed, mark `is_solo: false`. We want solo only.
5. Cross-reference email against `memory/do_not_email.txt`; drop matches.
6. Append fresh leads to master sheet, tagged with scrape date and source.

**Output:** 30-50 new solo-inspector rows per day in master sheet.

**Success criteria:**
- 1,000+ leads in sheet by end of week 2
- <5% duplicates
- 0 leads from do_not_email list
- ≥80% have a valid email format

**Notes:**
- Some states block scraping or require records requests — document those in this file as we go.
- High-priority states by inspector count: TX, FL, CA, NY, OH (skip), PA (skip), GA, NC, MI, IL, OH.
- Existing PA CSV at `~/Documents/inspectiq-outreach/pa_inspectors.csv` has 955 inspectors with metadata but only 9 have public emails. Backlog task: enrich those 955 with email scraping from their websites — 946 potential leads we already have names for.

---

## 2. Outbound Writer

**Purpose:** Take new leads from Lead Generator, write personalized cold emails, queue them in Instantly.ai.

**Schedule:** Daily at 7am, after Lead Generator finishes.

**Inputs:**
- Master Google Sheet (today's new rows)
- `memory/cold_email.md` sequence templates
- Lead's business website (live scrape for personalization)

**Process:**
1. Pull today's fresh rows from master sheet.
2. For each lead: visit their business website, extract any of {years in business, specialties, location-specific phrasing, recent project mentions}.
3. Fill template variables: `{first_name}`, `{business_name}`, `{state}`, `{city}`, `{years_licensed}`, `{specialty}`.
4. Generate Email 1 from the sequence template; queue in Instantly.ai with proper sending schedule.
5. Schedule Emails 2-5 as automated follow-ups stopped on reply/unsubscribe.
6. Log to `memory/metrics.md`: emails queued today, average personalization tokens filled.

**Output:** Personalized 5-email sequence queued for each new lead.

**Success criteria:**
- 100% of leads get personalized first emails (no fallback to generic)
- Average 3+ personalization tokens filled per email
- Open rate >40% across the campaign

---

## 3. Content Engine — v1 shipped 2026-05-03

**Purpose:** Write one SEO blog post per day for useinspectiq.com targeting long-tail home inspector keywords. Compounding organic traffic.

**Status:** v1 shipped. Blog route live at /blog. Generator script at `~/Documents/inspectiq-outreach/content_engine.py`. 30 keywords seeded, 3 posts generated.

**Schedule:** Daily — run `python3 content_engine.py generate` (can be automated via Cowork or cron).

**Script:** `~/Documents/inspectiq-outreach/content_engine.py`
- `init` — create SQLite DB, seed 30 keywords
- `generate` — write next post via Claude Haiku, save as MDX, mark published
- `status` — show published/pending counts
- `keywords` — list all keywords with status
- `add-keyword "..."` — add new target keyword

**Blog route:** `/blog` (listing) + `/blog/[slug]` (individual posts)
- MDX files in `src/content/blog/<slug>.mdx`
- Frontmatter: title, description, slug, publishedAt, tags, ogImage
- SEO metadata per post (title, description, canonical, OG, Twitter)
- Added to sitemap.xml and robots.txt
- Blog link in landing page nav + footer

**Inputs:**
- 30 long-tail keywords in SQLite DB (expandable via `add-keyword`)
- Brand voice rules embedded in system prompt (AI assists, never replaces)
- ANTHROPIC_API_KEY env var

**Output:** 1 published MDX blog post per run; commit + push to deploy.

**Success criteria:**
- Day 60: posts indexed in Google
- Day 90: organic traffic begins (10+ daily visits)
- Day 180: 100+ daily organic visits

---

## 4. Customer Success

**Purpose:** Convert trials to paid; reduce churn; respond to support quickly.

**Schedule:** Continuous (triggered by Stripe webhook events + inbox watching).

**Inputs:**
- Stripe webhook events (subscription.created, subscription.updated, etc.)
- support@useinspectiq.com inbox
- User's signup/usage data from Neon DB

**Process:**
1. **On signup:** send welcome email with 3-step quick start (sign up → enter first inspection → generate first report).
2. **Day 3 of trial:** "How's it going? Any questions?"
3. **Day 10 of trial:** "Trial ends in 4 days — here's what other inspectors say…"
4. **Day 13:** "Last day to lock in $99/mo before any future price increase."
5. **On subscription cancel:** "What was missing? Reply and I'll extend your trial 30 days." (win-back)
6. **Support inbox:** draft replies for Stephanie to review/send. Auto-send for FAQ-level questions only.

**Output:** Higher trial-to-paid conversion, lower churn, <2hr support response time.

**Success criteria:**
- Trial-to-paid: >25%
- Churn: <5% monthly
- Support median response: <2 hours

---

## How agents are run — UPDATED May 5, 2026 (launchd, NOT Cowork)

**Cowork scheduled tasks were DISABLED on May 5, 2026** because they fired unreliably for new tasks created after May 3. Diagnosis: tasks created after May 3 either never fired (one-time fireAt tasks 100% failure rate) or fired only sometimes (cron tasks). Replaced with native macOS `launchd` jobs which are rock-solid.

**Working directory moved May 5, 2026:** `~/Documents/inspectiq-outreach/` → `~/inspectiq-outreach/` (top-level home directory). Reason: macOS TCC restricts launchd-spawned processes from accessing `~/Documents`/`~/Desktop`/`~/Downloads` even when the script chmod is correct. Moving to `~/inspectiq-outreach/` removes the TCC gate entirely. Old directory is preserved as the source for `.command` helpers Stephanie can double-click in Finder (Finder runs in user TCC context, so `~/Documents` is fine for those).

**Live launchd agents:**

| Agent | Plist | Schedule | What it does |
|---|---|---|---|
| **com.erieapps.inspectiq-outbound** | `~/Library/LaunchAgents/com.erieapps.inspectiq-outbound.plist` | Weekdays 7am | Runs `cold_sender.py send --limit 100` from `~/inspectiq-outreach/`. Direct Gmail SMTP via App Password (NOT Zapier — that ran out of free tasks). 90s pacing built into script. Logs to `~/inspectiq-outreach/outbound.log`. |
| **com.erieapps.inspectiq-leadgen** | `~/Library/LaunchAgents/com.erieapps.inspectiq-leadgen.plist` | Daily 7pm | Reads first line of `~/inspectiq-outreach/states_queue.txt`, runs `lead_generator.py --state <state>`, imports CSV into cold_sender, applies do_not_email exclusion, pops state off queue. Logs to `~/inspectiq-outreach/leadgen.log`. |

**Auth:** Gmail App Password `cjia mqnz tzyr dwoz` (created May 5) is hardcoded into the outbound plist's `EnvironmentVariables`. Permissions on the plist file are 600 (owner-only readable). If it ever gets revoked, generate a new one at https://myaccount.google.com/apppasswords and update the plist.

**State rotation queue:** `~/inspectiq-outreach/states_queue.txt` — Florida already done May 5, California is at top, then NY, GA, NC, IL, MI, NJ, VA, AZ, WA, MA, IN, TN, MO, MD, WI, CO, MN, SC, AL.

**Helper `.command` files in `~/Documents/inspectiq-outreach/`** (double-clickable from Finder):
- `install_agents.command` — initial install of both launchd plists (already run May 5)
- `move_to_unrestricted.command` — moves working dir out of Documents (already run May 5)
- `check_progress.command` — peek at today's send count + active queue + launchd state
- `unsubscribe_<email>.command` — one-shot unsubscribe a specific email (template: copy + edit)
- `cleanup_for_tonight.command` — fixes queue + removes stale files
- `diagnose_california.command` — diagnostic for partial CSV (kept as reference)
- `rebuild_db.command` — full DB rebuild from CSVs (use if cold_sender.db corrupts)
- `fix_and_run.command` — REINDEX + reload (use if integrity_check fails)

**SMTP gotcha — needs fixing:** Today's run sent 100 emails successfully but exited with code 1 because the SMTP connection timed out at the end (Gmail drops idle persistent connections after ~1 hour, run took 2.5 hours). All 100 sends went out before the timeout. To fix later: add reconnect-every-N-emails logic in `cold_sender.py send_batch()`.

**Daily ops once running:**
- Reply detection: still manual. Reply lands in Gmail (Reply-To = stephanie@useinspectiq.com → forwards). Stephanie tells Claude → Claude runs unsubscribe.command or mark-replied.command.
- Watch metrics weekly: open rate >40%, reply rate >3%, unsubscribe <2%.
- Mac must stay on for launchd to fire. Sleep is fine (wakes for scheduled jobs). Shutdown is not.
