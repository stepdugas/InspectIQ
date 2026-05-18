# Erie Apps LLC — Formation + Operations

## Status (May 3, 2026)

**Not yet formed.** Decision made to file in PA. Backburner until InspectIQ has cold email infrastructure running. Target: form within 30 days.

## Why an LLC

- **Liability shield** — separates personal assets from business risk (especially relevant once InspectIQ has paying inspectors relying on AI-generated reports)
- **Tax flexibility** — pass-through by default; can elect S-corp at $50k+ profit to save self-employment tax
- **Legitimacy** — required for grant programs, easier B2B contracts, cleaner Stripe/Apple accounts
- **Banking + tracking** — clean separation of business income/expenses, much easier at tax time

## Filing checklist (Saturday morning task)

Source: matches Stephanie's Notes app entry.

- [ ] File PA Certificate of Organization at file.dos.pa.gov ($125)
- [ ] Choose registered agent (self at home address = free, or Northwest Registered Agent ~$125/yr for privacy)
- [ ] Get free EIN at irs.gov (10 min, same-day)
- [ ] Open Mercury or Relay business checking online (need EIN + filing PDF)
- [ ] Apply for Chase Ink Business Unlimited card (no annual fee, 1.5% back, ~$900 sign-up bonus)
- [ ] Download free single-member LLC operating agreement template (Northwest or Rocket Lawyer)
- [ ] Create Erie Apps Google Drive / Dropbox folder for documents
- [ ] Save: Certificate of Organization, EIN letter, operating agreement, banking login

## After LLC forms

- [ ] Update Apple Developer account → business name + EIN + Mercury/Relay banking
- [ ] App Store Connect: update Stacked Flashcards tax/banking
- [ ] App Store Connect: update Secret Place tax/banking
- [ ] Stripe (InspectIQ): switch from individual to business, add EIN
- [ ] Stripe (Dealership SaaS, when live): same
- [ ] RevenueCat (if used): add LLC info
- [ ] Move ALL business subscriptions to Chase Ink card (full list below)

## Subscriptions to move to LLC card

- Apple Developer Program ($99/year)
- Anthropic Claude Pro / Max
- Anthropic API (move to business billing on console.anthropic.com)
- GitHub Pro / Copilot
- Cursor / other AI coding tools
- Hosting: Netlify / Vercel / Render (every project)
- All domains: useinspectiq.com, cardealershipswebsitebuilder.com, stackedflashcards.com, Secret Place site
- Google Workspace (if used)
- Cloudflare
- Database hosting: Neon / Supabase
- Email service: Resend / Mailgun / SendGrid
- Analytics: Mixpanel / PostHog
- Buffer / social tools
- Figma / Canva
- ChatGPT (if used for business)
- RevenueCat (if used)
- Cloudinary (InspectIQ uses for photo storage)
- Clerk (InspectIQ auth)
- Instantly.ai or Smartlead (cold email infrastructure — not yet purchased)

## Tax write-offs to track from day one

Every business expense reduces taxable income — at Stephanie's bracket, ~30¢ saved per $1 deducted. Track these:

**Top tier (highest savings):**
- Home office: % of home sq ft × (rent/mortgage interest, utilities, insurance, HOA, repairs)
- SEP-IRA or Solo 401(k) contributions (up to $69k/yr deduction at scale)
- Health insurance premiums (100% deductible if self-employed)
- Section 179 equipment: MacBook, monitors, iPad for testing, iPhone for App Store testing
- QBI deduction (automatic 20% off pass-through income — TurboTax handles)

**Daily / monthly:**
- All software subscriptions (above list)
- Internet & phone (% business use)
- Vehicle mileage (67¢/mi for business drives — log via MileIQ)
- Education: books, courses, conferences (WWDC, MicroConf)
- Marketing: cold email tools, SEO software, design tools
- Professional services: accountant, lawyer, registered agent
- Bank/credit card fees, Stripe fees, Apple's 30% cut
- State LLC fees (PA: $70/yr annual report)

**Year-1 specific:**
- Up to $5k startup costs deduction (filing fee, books, research, design)

**Often missed:**
- Augusta Rule (Section 280A): rent home to LLC up to 14 days/yr tax-free to Stephanie, deductible to LLC
- R&D Tax Credit: software dev with technical uncertainty qualifies — use TaxRobot/MainStreet at $30k+ dev expenses
- Bad debt (failed dealership SaaS payment, etc.)

## Tracking system

**Recommended:** Wave (free) to start, graduate to QuickBooks Self-Employed ($15/mo) when InspectIQ revenue >$3k/mo.

**Process:**
- Connect Mercury/Relay bank to tracking software
- Connect Chase Ink card
- Weekly 15-min sync every Sunday: tag any miscategorized transactions
- Photo capture every receipt over $75 (Mercury app or Expensify)

## TurboTax flow (Q1 2027 for tax year 2026)

- Buy TurboTax Self-Employed / Premium (~$130). Don't get cheaper tier — no Schedule C support.
- Single-member LLC = disregarded entity = files Schedule C on personal 1040
- Import expenses from QuickBooks / Wave (one click)
- Schedule C categories: advertising, contract labor, office expense, software (under "other"), supplies, travel, meals (50%), utilities, depreciation
- Home office: simplified ($5/sqft, max $1,500) OR actual-expense method (% of housing). TurboTax picks higher.
- Set aside 25-30% of profit monthly in separate Mercury sub-account for taxes (don't spend it)
- Quarterly estimated payments due Apr 15, Jun 15, Sep 15, Jan 15 once profitable

## When to elect S-corp

**Trigger:** Erie Apps profits ≥$50k/year.

**Why:** Pay yourself a "reasonable salary" via payroll, take rest as distributions exempt from 15.3% self-employment tax. Saves $5-10k/year at $80k profit.

**Cost:** Payroll service + slightly more complex bookkeeping. Worth it past the threshold.

**Talk to a CPA before electing.**

## Future capital sources

When LLC is real with revenue:

- **PA Small Business Advantage Grant** (PA-specific)
- **Ben Franklin Technology Partners** (PA-specific tech founder funding, very founder-friendly)
- **Federal SBIR/STTR grants** for software/AI R&D
- **Business credit cards 0% intro APR** for growth without touching personal credit
- **R&D tax credit** (dollar-for-dollar credit, not deduction — huge for software work)
