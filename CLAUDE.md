@AGENTS.md
@memory/index.md

# Working Context — Erie Apps / InspectIQ

> This is the master file every Claude session reads first. Keep it short and current. Deep knowledge lives in `memory/`. Active task list lives in `TASKS.md`.

**Last updated:** 2026-05-03

---

## Who's running this

Stephanie Dugas (signs off as "Bro" in casual contexts).
- Email: stepdugas@gmail.com
- Day job: full-time software engineer at an insurance company
- Goal: transition to full-time indie dev making $100k+/year via Erie Apps LLC

## What Erie Apps is

A planned Pennsylvania single-member LLC that will own all four of Stephanie's products:
1. **InspectIQ** — AI home inspection report SaaS, $99/mo, 14-day trial. useinspectiq.com. **CURRENT FOCUS.**
2. **Dealership SaaS** — car dealership website builder, $1k setup + $50/mo. cardealershipswebsitebuilder.com.
3. **Stacked Flashcards** — iOS app, $2.99/mo or $19.99/yr. stackedflashcards.com. 4 paying users.
4. **The Secret Place** — iOS Christian meditation app, $4.99/mo. 1 paying user. Cassia records meditations.

LLC is NOT yet formed. Filing is on the backburner — see `memory/erie_apps_llc.md` for the full plan + checklist (matches Stephanie's Notes app).

## The 90-day priority sprint (May 3 – Aug 1, 2026)

**InspectIQ is the #1 priority.** Goal: 40 paying customers ($3,960 MRR).
**Strategy:** AI workforce running cold email + SEO content + customer success on autopilot.
**Other projects:** only get attention when InspectIQ is on track or for active bug fixes (e.g., dealership bugs from Stephanie's dad, Cassia's Secret Place meditations).

Why InspectIQ first: $99/mo with a 14-day trial removes friction; B2B with budget; clear pain (4-6 hours per report); easy to find via state licensing boards; competitors don't have AI narratives.

## Critical diagnosis (do not skip)

Stephanie has **already cold-emailed 261 inspectors** (160 Ohio + 101 Pennsylvania) via Cowork scheduled tasks and a Python script — and converted **zero**. The product is good. The outreach is broken. Reasons:

1. **Generic emails.** Greeting is just "Hi," — no first name, no business name, no personalization. Tanks reply rates.
2. **No follow-up sequence.** One email per recipient, no day-3/7/12 bumps. Single sends convert at ~0.5%; sequences at 4-8%.
3. **Sent from personal Gmail** (`stepdugas@gmail.com`) with no domain warmup, SPF, DKIM, or DMARC. Half the emails likely landed in spam.
4. **No tracking.** No open rates, click rates, or A/B testing. No way to iterate.
5. **Subject line "Save hours writing your home inspection reports"** reads as B2B spam — should be tested against curiosity-led / founder-to-founder lines.

The fix is the AI workforce + a free email sending infrastructure built on Namecheap's existing email forwarding + Brevo SMTP relay + Gmail "Send mail as" — Path B (Stephanie chose this on May 3, 2026 after confirming Zoho free was discontinued and Cloudflare migration was overkill). See `memory/cold_email.md` for the full free stack and Saturday-morning setup checklist.

## Existing assets

- **InspectIQ codebase** (this folder, `/Users/stephaniedugas/Documents/inspectiq/`)
  - Next.js 16, Neon Postgres + Drizzle, Clerk auth, Anthropic Claude opus-4-6, Stripe ($99/mo + 14-day trial), Cloudinary, Vercel.
  - Acquired via Flippa. Comes with `MARKETING_BLUEPRINT.md`, `TECHNICAL_HANDOVER.md`, `README.md`. Don't lose those.
  - User prefs incorrectly say "Spring Boot + Vue 3" — that's outdated, the actual stack is Next.js + Postgres.
- **PA inspector data** (`/Users/stephaniedugas/Documents/inspectiq-outreach/pa_inspectors.csv`)
  - 955 PA inspectors with name/business/city/phone/website/profile_url. Only 9 have emails in the CSV — the rest need website scraping to fill in. Treat this as a goldmine waiting to be enriched.
- **Already-emailed list** (`memory/do_not_email.txt`) — 261 unique addresses. NEVER re-email these.
- **Cowork scheduled tasks**: `~/Documents/Claude/Scheduled/ohio-inspectiq-outreach` and `inspectiq-pa-resend-and-ohio`. Old approach; will be superseded by Instantly.ai + AI agents.

## Today's status

In progress:
- 90-day InspectIQ sprint (started May 3, day 0)

Shipped May 3, 2026 (Day 0 of sprint):
- ✅ Memory system (this file + `memory/`)
- ✅ Outbound Writer agent — `~/Documents/inspectiq-outreach/cold_sender.py`
- ✅ Lead Generator agent — `~/Documents/inspectiq-outreach/lead_generator.py` (any state via NACHI)
- ✅ PA Email Enricher (bonus) — `~/Documents/inspectiq-outreach/enrich_pa.py`
- ✅ Email forwarding live for `support@useinspectiq.com` + `stephanie@useinspectiq.com`
- ✅ Cold email infrastructure: send via Gmail SMTP, Reply-To = stephanie@useinspectiq.com
- ✅ 317-address do-not-email exclusion list at `memory/do_not_email.txt`

- ✅ Content Engine agent — `~/Documents/inspectiq-outreach/content_engine.py` + blog route at /blog (30 keywords, 3 posts live)
- ✅ Full code review: 29 security, UX, and feature fixes shipped (Stripe Connect, draw signature, pre-inspection agreements, defect numbering, duration tracking, and more)
- ✅ ISN password encryption (AES-256-GCM)

Not yet shipped:
- Customer Success agent — best built when first trial signups exist (currently 0 customers)

## AUTONOMOUS PIPELINE LIVE (May 5, 2026)

The full agent stack now runs without human input via macOS launchd:
- **Outbound writer** fires every weekday 7am → sends 100 emails with 90s pacing → done by 9:30am
- **Lead generator** fires every day 7pm → scrapes next state from `~/inspectiq-outreach/states_queue.txt` → ~90 min runtime
- Working directory: `~/inspectiq-outreach/` (NOT `~/Documents/inspectiq-outreach/` — moved May 5 due to macOS TCC restrictions blocking launchd)
- Auth: Gmail App Password baked into outbound plist
- Cowork-scheduled tasks DISABLED (they fired unreliably — diagnosis in `memory/agents.md`)

**May 5 results:**
- 115 emails sent today (15 manual via Zapier + 100 autonomous via launchd direct SMTP)
- 1 unsubscribe (Ramon Rivera at npiinspect.com — handled, in do_not_email)
- Florida fully scraped (867 emails captured, 50% yield)
- States queue order: California (next), New York, Georgia, North Carolina, Illinois, Michigan, New Jersey, Virginia, Arizona, Washington…

**What Stephanie does daily:** Nothing routine. Just:
- Tell Claude when someone replies (unsubscribe, interested, etc.)
- Run `~/Documents/inspectiq-outreach/check_progress.command` to peek at numbers
- Don't shut down the Mac (launchd needs it on; sleep is fine)

## STRATEGY SHIFT (May 7, 2026) — moved from outreach mode to feedback mode

Now that we have real trial users (Julio Paredes started May 7), priority 
shifts from "send more cold emails" to "talk to actual users." Cold email keeps 
running on autopilot in the background, but the leverage now is:

1. **Watch trial users' actual behavior** — query cold_sender.db / Stripe / 
   Clerk to see what they do post-signup. Did they create an inspection? Pick 
   TREC 7-6? Generate a report? Each click is a data point.
2. **Schedule 15-min listening calls** Day 5-7 of each trial — just listen. 
   "Walk me through what you tried. What was easier than expected? What was 
   harder?"
3. **Track feature requests** — when 3+ trial users ask for the same thing, 
   build it. One person asking = nice-to-have. Three asking = roadmap item.
4. **Ask for testimonials Day 12-13** — happy trials get a "would you write 
   a one-paragraph quote?" message. Most say yes if asked.
5. **Put quotes on the homepage** the moment we have them. One real 
   testimonial outconverts most paid ads.

This is also the trigger to build **Task #6 (Customer Success agent)** — 
Day 3/10/13 trial conversion emails need to fire automatically.

**Next sprint moves (when InspectIQ has trial signups):**
1. After first trial signup → build Customer Success agent (Task #6)
2. After PA approves Erie Apps LLC → switch banking + apps (Task #8)
3. Apply for grants (Task #16) — woman-owned/AI/PA-tech eligibility

## Read before doing work

- `memory/index.md` — table of contents for everything in `memory/`
- `memory/inspectiq.md` — product details, tech stack, what's built
- `memory/cold_email.md` — sequence, sending rules, metrics
- `memory/agents.md` — every AI employee, what it does, schedule
- `memory/erie_apps_llc.md` — LLC formation status + checklist
- `memory/people.md` — Stephanie, Cassia, Stephanie's dad, anyone else relevant
- `TASKS.md` — active work, status, owners

## Voice / tone

- Direct, warm, real. Stephanie responds well to honesty about what's working and what isn't.
- "Bro" is her casual nickname. Use it in conversation. Use "Stephanie" in formal contexts (cold email footers, LLC docs, etc.).
- Don't manufacture optimism. Ship truth + the next concrete step.
