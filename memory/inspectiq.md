# InspectIQ — Product Memory

## What it is

AI-powered home inspection report SaaS for licensed home inspectors. Inspector takes photos, drops shorthand notes, AI generates the full professional narrative report (color-coded severity, branded PDF, client share link). Same-day delivery in minutes vs the 4-6 hours competitors require.

**Live at:** https://www.useinspectiq.com
**Pricing:** $99/month, 14-day free trial, card required at signup.
**Currently:** 0 paying customers (acquired via Flippa, in growth phase).

## Origin

Acquired from a previous owner via Flippa. Came with full codebase, marketing blueprint, technical handover docs. Stephanie added her own positioning ("software engineer + small business family upbringing → built this so inspectors can spend less time on paperwork, more time with clients").

## Tech stack (do not assume — verify before changes)

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + TypeScript |
| Database | Neon (serverless Postgres) + Drizzle ORM |
| Auth | Clerk |
| AI | Anthropic Claude `claude-opus-4-6` (can downgrade to haiku to cut costs) |
| Payments | Stripe ($99/mo, 14-day trial, webhook for subscription events) |
| Photos | Cloudinary |
| UI | shadcn/ui + Tailwind + Framer Motion |
| PDF | @react-pdf/renderer |
| Hosting | Vercel |

Monthly infra cost at launch: ~$0 (all on free tiers). AI cost scales with usage.

## Database schema (high level)

- `profiles` — one per Clerk user, stores inspector info + Stripe subscription status
- `inspections` — one per job, linked to a profile
- `rooms` — multiple per inspection (from 15 InterNACHI templates)
- `inspection_items` — multiple per room, with condition + notes + AI-generated narrative
- `reports` — one per inspection, stores share token

## Key files in codebase

- `src/app/page.tsx` — animated landing page
- `src/app/dashboard/inspections/[id]/` — inspection editor (the core UX)
- `src/app/api/ai/generate-narrative/route.ts` — Claude AI prompt (edit here to tune narrative quality)
- `src/lib/inspection-templates.ts` — 15 InterNACHI room templates
- `src/lib/db/schema.ts` — Drizzle schema
- `src/components/report/PDFReport.tsx` — react-pdf cover + summary + detail pages
- `src/app/admin/page.tsx` — password-gated admin dashboard (MRR, user list, seed demo)

## Pitch (Stephanie's voice)

> My parents have run their own small business my whole life — taught me early that the folks who do the actual work shouldn't be buried in paperwork. I'm a software engineer, and I built InspectIQ because home inspectors are buried in paperwork. You walk the house, take photos, jot notes — then go home and spend 4-6 hours typing it up. With InspectIQ you inspect, upload photos, drop shorthand notes, and AI writes the full professional report. Same day. In minutes. So you spend the time you saved talking to the buyer instead of typing.

## ICP (target customer)

- Solo home inspectors / 1-person shops (chosen May 3, 2026)
- US-wide (all 50 states)
- Newly licensed and veterans both — sequence will A/B test which segment converts better
- Solo because: easier sale, fast decision, smaller decision-maker chain

## Competitors

| Tool | Price | AI narratives? |
|---|---|---|
| Spectora | $99–$249/mo | No |
| HomeGauge | $99/mo | No |
| ISN | $79–$199/mo | No |
| Palm-Tech | $99/mo | No |
| **InspectIQ** | **$99/mo** | **Yes** |

The differentiator is the AI narrative generation — none of the legacy tools have it.

## Pricing escalation plan

- **0–25 paying users:** $99/mo (current). Focus on MRR growth, not margin.
- **25–50 users:** Raise to $129/mo (grandfather existing).
- **50+ users:** Add Team plan at $249/mo (5 inspectors).
- **Annual option** at $79/mo billed yearly ($948/year): improves cash flow, reduces churn.

## Growth roadmap (what to build next, when InspectIQ has traction)

1. Auto-email PDF report to client when inspection complete (Resend, ~2 hrs work, big stickiness)
2. Inspection scheduling + Google Calendar integration
3. Photo-in-PDF (Cloudinary infra is already there)
4. Team accounts ($149/mo tier)
5. Mobile PWA for offline use (basements, crawlspaces)
6. Zapier integration to realtor CRMs
7. White-label tier ($299/mo) for agencies

## Marketing assets that came with the acquisition

`MARKETING_BLUEPRINT.md` in this folder has:
- Top 20 home inspector associations (InterNACHI, ASHI, NAHI, etc.) with channel notes
- Facebook groups (Home Inspectors with 47k members is biggest)
- 5 cold email templates (direct, realtor, training school, conference follow-up, win-back)
- LinkedIn DM scripts
- SEO target keywords
- Pricing strategy

## Known issues / customization needed

From `README.md`:
- [ ] Replace `inspectiq.app` references with `useinspectiq.com` throughout codebase
- [ ] Update `support@inspectiq.app` in `/src/app/privacy/page.tsx` and `/src/app/terms/page.tsx`
- [ ] Set strong `ADMIN_PASSWORD` in Vercel env vars
- [ ] Implement `logoUrl` field upload in profile settings
- [ ] Adjust room templates if needed in `src/lib/inspection-templates.ts`
