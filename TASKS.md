# TASKS — Erie Apps / InspectIQ

> Active work list. Persists across all Claude sessions. Update status as tasks move; append new ones below; don't delete completed (move to ## Done).

## In progress

- [~] **#1 — 90-Day InspectIQ Priority Sprint** (May 3 – Aug 1, 2026). Goal: 40 paying customers / $3,960 MRR. InspectIQ is #1 priority; other projects only get attention when InspectIQ is on track or has active bug fixes. Started 2026-05-03.
- [~] **#3 — Build the Outbound Writer agent.** Cold email v1 sequence drafted (5 emails over 30 days, founder-to-founder tone). Saved to `outputs/inspectiq_cold_email_v1.md`. Will be canonicalized to `memory/cold_email.md` once approved by Stephanie. Next: build the Claude agent that takes new leads, scrapes their business website for personalization, fills variables, queues in Instantly.ai/Smartlead.
- [~] **#9 — Set up persistent Claude memory system.** CLAUDE.md, memory/, and TASKS.md created in `/Users/stephaniedugas/Documents/inspectiq/`. memory/do_not_email.txt populated with 261 already-contacted addresses. ✅ **Functionally complete** — needs Stephanie's review.

## Pending

- [ ] **#2 — Build the Lead Generator agent.** Daily-running agent that scrapes state licensing boards for solo home inspectors. 30-50 fresh leads/day to master sheet. Skip PA and OH (most contacts already emailed). Goal: 1,000+ leads in sheet by week 2. **Blocked by:** #9 (memory system) and #10 (do-not-email list) — both now done, this can start.
- [ ] **#4 — Set up FREE cold email sending infrastructure.** Stephanie chose the $0/month path. Zoho Mail Free at useinspectiq.com (free, custom domain, 5 users) + SPF/DKIM/DMARC via Cloudflare + Mailtrack/Streak free for tracking + extend existing `send_emails.py` to use Zoho SMTP. Target: 30-50 emails/day to start, ramp to 100/day after 3-4 weeks. Full checklist in memory/cold_email.md. Saturday-morning task, ~90 minutes.
- [x] **#5 — Build the Content Engine agent.** Daily SEO blog post for useinspectiq.com. Long-tail home inspector keywords. Goal: 60 posts in 60 days. Script at `~/Documents/inspectiq-outreach/content_engine.py`. Blog route live at /blog. 3 posts generated. (Completed 2026-05-03)
- [ ] **#6 — Build the Customer Success agent.** Drafts support replies, sends day-3/10/13 trial conversion emails, win-back to churned, onboarding to new signups. Goal: trial-to-paid >25%.
- [ ] **#7 — Form Erie Apps LLC** (backburner). PA filing ($125), free EIN, Mercury/Relay account, Chase Ink card. Saturday morning task. Full checklist in `memory/erie_apps_llc.md`.
- [ ] **#8 — Switch InspectIQ + apps to Erie Apps LLC banking.** After #7 forms LLC. Update Apple Developer, App Store Connect (Stacked + Secret Place), Stripe (InspectIQ + Dealership), RevenueCat. Move all subscriptions to Chase Ink card.
- [ ] **#11 — Enrich the 946 PA inspectors without emails** (the CSV has 955 rows, only 9 with emails). Scrape their business websites for contact emails. Could double our usable lead pool overnight.
- [ ] **#12 — Customize codebase per README.** Replace `inspectiq.app` → `useinspectiq.com` throughout. Update `support@inspectiq.app` in privacy/terms pages. Set strong `ADMIN_PASSWORD`. Implement `logoUrl` upload in profile settings.
- [x] **#13 — Add a blog route to the InspectIQ Next.js app.** /blog listing + /blog/[slug] pages, MDX-based, SEO metadata, sitemap integration, prose styling. (Completed 2026-05-03)

## Done

- ✅ **#10 — Find existing OH + PA scrape data.** Found at `~/Documents/inspectiq-outreach/pa_inspectors.csv` (376 rows total — earlier 955 count was a wc -l artifact from multi-line CSV cells. 303 had emails, 73 enrichable, 0 dead). Plus `~/Documents/Claude/Scheduled/` (160 OH + 103 PA-resend SKILL.md files). All 317 unique already-touched addresses extracted to `memory/do_not_email.txt`. (Completed 2026-05-03)
- ✅ **#9 — Set up persistent Claude memory system.** CLAUDE.md, memory/, TASKS.md live at `~/Documents/inspectiq/`. Future Claude sessions read context automatically. (Completed 2026-05-03)
- ✅ **#3 — Build the Outbound Writer agent.** Code at `~/Documents/inspectiq-outreach/cold_sender.py`, ~580 lines, stdlib only. Full 5-email sequence, personalization, SQLite tracking, exclusion list, CAN-SPAM compliant. Tested end-to-end. Ready for live sends once Stephanie generates Gmail App Password. (Completed 2026-05-03)
- ✅ **#4 — Set up FREE cold email infrastructure.** Pivoted from Brevo SMTP relay to direct Gmail SMTP after realizing Brevo was over-engineering for first campaign. Final stack: Namecheap forwarding for `support@` + `stephanie@` + Gmail SMTP for sending. (Completed 2026-05-03)

## How to use this file

- Mark `[ ]` pending, `[~]` in progress, `[x]` completed (then move to ## Done section)
- New tasks get appended to the bottom of ## Pending with a new ID number
- Reference task IDs in commits and PRs
- Don't delete tasks — they're history. Move to Done.
