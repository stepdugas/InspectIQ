# Cold Email — Sequence + Rules

## Status (May 3, 2026)

**v1 sequence drafted, not yet sent.** Replaces the generic "Hi," single-email approach Stephanie used previously (261 inspectors emailed, 0 conversions — see diagnosis in CLAUDE.md).

**v1 lives in:** `outputs/inspectiq_cold_email_v1.md` (working draft) → will be canonicalized here once approved.

## Sequence overview

5-email sequence over 30 days, founder-to-founder casual tone. Self-serve trial CTA (no demo, no calls). Subject lines lowercase, under 6 words, look like a real person typing.

| # | Day | Subject | Purpose |
|---|---|---|---|
| 1 | 0 | `from one small biz family to another` | Story + value + CTA |
| 2 | 3 | `{first_name}, did this slip through?` | Bump (no fake reply prefix — Stephanie chose to drop the "re:" trick May 4 as deceptive) |
| 3 | 7 | `{first_name} — how many hours after each job?` | Question-led, different angle |
| 4 | 12 | `last one, {first_name}` | Soft close, "I'll quit your inbox" |
| 5 | 30 | `{first_name}, one more thought` | Reactivator |

## Key principles

- **Personalization is non-negotiable.** Every email must include `{first_name}`, `{state}`, and at least one of `{business_name}` or `{city}`. Generic "Hi," kills reply rates (this is what tanked the previous campaign).
- **Self-serve CTA only.** Trial link to useinspectiq.com — no demo booking. Inspectors are wary of sales calls.
- **Vulnerable closer in #4.** "If your evenings are still going to writing them up, give the trial a shot. If not, I'll quit your inbox." Permission-to-leave gets the highest reply rates.
- **Footer rotation.** Until Erie Apps LLC forms: "Bro" in body, real address (PO box) in compliance footer. After LLC: "Stephanie Dugas, Founder, Erie Apps LLC" in formal footer.
- **DO NOT email anyone in `memory/do_not_email.txt`.** That's 261 already-contacted inspectors. Re-emailing burns domain reputation and is rude.

## Sending infrastructure — FREE path (chosen May 3, 2026)

Stephanie chose the $0/month path. **Path B selected** after confirming Zoho Forever Free with custom domain was discontinued in 2024 and Cloudflare migration was overkill for shipping the first cold campaign.

**Stack (Path B — Namecheap-native):**
- **Email RECEIVING:** Namecheap's free email forwarding (already active on useinspectiq.com — MX records confirmed). Add forwarding rules: `support@useinspectiq.com` → `stepdugas@gmail.com`, `stephanie@useinspectiq.com` → `stepdugas@gmail.com`.
- **Email SENDING:** Brevo (formerly Sendinblue) free SMTP relay (300 sends/day, free forever).
- **Send-from-custom-domain in Gmail:** Configure "Send mail as" in Gmail Settings using Brevo's SMTP credentials. Lets Stephanie compose/reply as `stephanie@useinspectiq.com` directly inside Gmail.
- **DNS authentication:** SPF + DKIM + DMARC TXT records added at Namecheap (Brevo provides the values during their domain verification flow).
- **DNS host:** Namecheap (no migration to Cloudflare). Nameservers confirmed: dns1/dns2.registrar-servers.com.
- **Sender script (cold email automation):** Python `smtplib` — extend `~/Documents/inspectiq-outreach/send_emails.py`, point it at Brevo SMTP (smtp-relay.brevo.com) instead of Gmail SMTP. Use `stephanie@useinspectiq.com` as the From address.
- **State tracking:** SQLite DB or CSV with columns: `email, last_sent_step, last_sent_date, replied, unsubscribed`
- **Lead storage:** Google Sheets (free)
- **Email finder fallback:** Hunter.io free (25/mo) + Apollo.io free (50 credits/mo)
- **Open/reply tracking:** Mailtrack.io free (Chrome extension) + Streak CRM free (Gmail pipeline)
- **Sending cadence:** Start 30/day, ramp to 50/day after week 1, 100/day after week 3
- **Send window:** 8am–4pm local time of recipient
- **Stop on reply:** yes (Streak handles)
- **Stop on unsubscribe:** yes (CAN-SPAM mandatory)

**Total cost: $0/month.**

## Setup checklist (Path B — Namecheap + Brevo)

1. [x] Log into Namecheap → Domain List → useinspectiq.com → Manage → Email Forwarding ✅ (May 3, 2026)
2. [x] Add forwarding: `support@useinspectiq.com` → `stepdugas@gmail.com` ✅ (was already configured)
3. [x] Add forwarding: `stephanie@useinspectiq.com` → `stepdugas@gmail.com` ✅ (May 3, 2026)
4. [ ] Send test email to support@useinspectiq.com and stephanie@useinspectiq.com from another address; confirm both land in Gmail
5. [ ] Sign up for Brevo free at brevo.com (Stephanie creates the account herself)
6. [ ] In Brevo: add and verify domain `useinspectiq.com` (Brevo provides DNS records)
7. [ ] Add Brevo's DNS records at Namecheap → useinspectiq.com → Advanced DNS: SPF (or merge with existing), DKIM, optional DMARC
8. [ ] In Brevo: generate SMTP credentials (username + SMTP key)
9. [ ] In Gmail Settings → Accounts → Send mail as → Add `stephanie@useinspectiq.com` → Use SMTP server: smtp-relay.brevo.com, port 587, with Brevo credentials
10. [ ] Repeat step 9 for `support@useinspectiq.com`
11. [ ] Send test email FROM stephanie@useinspectiq.com via Gmail → confirm it lands in another inbox not in spam
12. [ ] Test mail-tester.com score — aim for 9/10 minimum
13. [ ] Update `send_emails.py` to use smtp-relay.brevo.com:587 with Brevo creds and `stephanie@useinspectiq.com` as From

**Trade-offs vs paid:**
| | Paid (~$97/mo) | Free (chosen) |
|---|---|---|
| Daily volume | 500-1500 | 50-100 |
| First 1k sends | 2 weeks | 3-4 weeks |
| Tracking | Auto dashboard | Manual via Mailtrack + Streak |
| Time to 40 paying customers | 60-75 days | 90-120 days |

We can flip to Instantly.ai later if MRR justifies it. Free path doesn't lock anything in.

## Saturday-morning setup checklist

1. [ ] Sign up for Zoho Mail Free at zoho.com/mail → add domain `useinspectiq.com`
2. [ ] Verify domain ownership (TXT record in Cloudflare)
3. [ ] Create user `bro@useinspectiq.com` (or chosen alias)
4. [ ] Add MX records pointing to Zoho mail servers
5. [ ] Add SPF record: `v=spf1 include:zoho.com ~all`
6. [ ] Add DKIM record (Zoho generates it)
7. [ ] Add DMARC record: `v=DMARC1; p=none; rua=mailto:bro@useinspectiq.com`
8. [ ] Wait 24 hours for DNS propagation
9. [ ] Send test email from new address to personal Gmail; verify inbox not spam
10. [ ] Send test email to mail-tester.com; aim for 9/10 score minimum
11. [ ] Install Mailtrack Chrome extension on personal Gmail (or Zoho)
12. [ ] Install Streak CRM free
13. [ ] Update `send_emails.py` to use Zoho SMTP (smtp.zoho.com:465 SSL) instead of Gmail SMTP

## Success metrics + kill thresholds

| Metric | Target | Kill (rewrite if below) |
|---|---|---|
| Open rate | >40% | <25% |
| Reply rate | >3% | <1% |
| Click-through | >2% | <0.5% |
| Unsubscribe | <0.5% | >2% (tone too aggressive) |
| Spam complaints | <0.1% | >0.3% (kill domain, restart) |
| Trial start rate (clicks → trials) | >30% | <10% (landing page issue) |
| Trial-to-paid | >20% | <10% (product/onboarding) |

## Compliance / legal

- Physical address in every footer (CAN-SPAM): use Stephanie's PO box until LLC forms with virtual address
- Unsubscribe link in every email
- Don't claim reports satisfy specific state regulations unless verified
- Never imply AI replaces inspector judgment — software speeds up writing only

## What NOT to do (lessons from prior campaign)

1. ❌ Don't send from personal Gmail. Personal accounts can't warm up properly and get throttled.
2. ❌ Don't send a single email and stop. 70%+ of replies come from the follow-ups.
3. ❌ Don't use generic "Hi,". Personalize first name minimum, ideally + state + business name.
4. ❌ Don't use benefit-led subject lines like "Save hours writing your reports" — too spammy. Curiosity > benefit for cold.
5. ❌ Don't skip domain warmup. Sends without warmup land in spam half the time.
6. ❌ Don't re-email anyone in do_not_email.txt. Burns reputation, annoys inspectors.

## A/B tests planned

- v2: question-led subject lines vs story-led
- v3: insert specific pain point in opener ("those evenings finishing reports")
- v4: 30-second Loom video link in Email 3
- v5: testimonial from first 3-5 paying customers in Email 1 (once we have them)
