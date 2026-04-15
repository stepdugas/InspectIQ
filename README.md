# InspectIQ — AI Home Inspection Report Generator

> **Complete, production-ready SaaS for home inspectors. AI-generated PDF reports. Stripe billing. Full codebase + operator playbook included.**

---

## What You're Getting

InspectIQ is a vertical SaaS built specifically for licensed home inspectors. It converts room-by-room field notes into professional, color-coded, branded PDF reports in minutes — powered by Claude AI (Anthropic). The product is complete, deployed, and ready to accept paying customers at $99/month.

**Core Features:**
- AI-generated professional report narratives per room (one click)
- Color-coded severity: Critical (red) / Maintenance Needed (yellow) / Satisfactory (green)
- Cover page + Summary of Findings + detailed room-by-room PDF export
- Branded PDF with company logo, license number, and inspector contact info
- Secure client share links — clients view reports with no login required
- Photo upload per inspection item (Cloudinary-hosted, auto-compressed)
- Full inspection management dashboard
- Stripe subscription billing ($99/month, 14-day free trial, card required)
- Password-protected admin dashboard — monitor all users, MRR, inspection counts
- Cross-device sync — data lives server-side, works on phone, tablet, desktop
- Built-in Privacy Policy and Terms of Service pages

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + TypeScript |
| Database | Neon (serverless PostgreSQL) + Drizzle ORM |
| Auth | Clerk (email + social sign-in) |
| AI | Anthropic Claude claude-opus-4-6 |
| Payments | Stripe (subscription + 14-day trial) |
| Photo Storage | Cloudinary |
| UI | shadcn/ui + Tailwind CSS + Framer Motion |
| PDF | @react-pdf/renderer (client-side) |
| Hosting | Vercel (free tier) |

**All services have free tiers. Monthly infrastructure cost at launch: $0.**

---

## Setup Guide (New Owner)

### Step 1 — Clone & Install
```bash
git clone <your-repo-url>
cd inspectiq
npm install
```

### Step 2 — Create a Neon Database (Free)
1. Go to neon.tech → Create Account → New Project
2. Name it anything (e.g. "InspectIQ"), choose AWS US East 1, Postgres 17
3. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`)
4. Paste it as `DATABASE_URL` in your `.env.local`
5. Run: `DATABASE_URL="your_connection_string" npx drizzle-kit push`
   This creates all tables automatically.

### Step 3 — Create a Clerk Account (Free)
1. Go to clerk.com → Create Account → New Application → name it "InspectIQ"
2. Enable Email sign-in
3. Copy the Publishable Key and Secret Key from the API Keys page
4. In Configure → Paths, set sign-in/sign-up to use your development host:
   - Sign-in: `/auth/login`
   - Sign-up: `/auth/signup`
   - After sign-out: `/auth/login`

### Step 4 — Create a Cloudinary Account (Free)
1. Go to cloudinary.com → Create Account
2. From the dashboard, copy: Cloud Name, API Key, API Secret

### Step 5 — Get an Anthropic API Key
1. Go to console.anthropic.com → API Keys → Create Key
2. The app uses `claude-opus-4-6` — you can downgrade to `claude-haiku` to reduce AI costs

### Step 6 — Set Up Stripe
1. Create a Product: **InspectIQ Pro** → Price: **$99/month** recurring
2. Copy the Price ID (starts with `price_`)
3. Copy your Secret Key and Publishable Key from Developers → API Keys
4. After deploying to Vercel, set up a webhook:
   - URL: `https://yourdomain.vercel.app/api/stripe/webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook signing secret (starts with `whsec_`)

### Step 7 — Configure Environment Variables
Create `.env.local` in the project root:
```
DATABASE_URL=postgresql://...@....neon.tech/neondb?sslmode=require

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

ANTHROPIC_API_KEY=sk-ant-...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NEXT_PUBLIC_APP_URL=https://yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password
```

### Step 8 — Deploy to Vercel
```bash
npx vercel --prod
```
Add all env vars in Vercel dashboard → Project → Settings → Environment Variables.

### Step 9 — Seed Demo Data (Optional)
Log into the admin panel (`/admin/login`) → click **Seed Demo Data** to populate 5 realistic mock inspections.

### Step 10 — Configure Stripe Webhook
After deploy, add the webhook URL in Stripe → Developers → Webhooks:
`https://yourdomain.vercel.app/api/stripe/webhook`

---

## Admin Dashboard

Access at `/admin/login` — completely separate from the inspector dashboard.

Enter your `ADMIN_PASSWORD` to see:
- Total users, active subscribers, trial users
- MRR (calculated from active subscriptions at $99/month)
- All users table with subscription status and join date
- Seed Demo Data button

To change the password, update `ADMIN_PASSWORD` in your Vercel environment variables and redeploy.

---

## Customization Checklist

- [ ] Replace `inspectiq.app` references with your domain (search the codebase)
- [ ] Update `support@inspectiq.app` in `/src/app/privacy/page.tsx` and `/src/app/terms/page.tsx`
- [ ] Set `ADMIN_PASSWORD` to something secure
- [ ] Adjust the price in the landing page if you change the Stripe price
- [ ] Optionally adjust room templates in `src/lib/inspection-templates.ts`
- [ ] Add your own logo by implementing the `logoUrl` field in the profile settings

---

## Architecture Overview

```
src/
├── app/
│   ├── page.tsx                         # Animated landing page
│   ├── auth/login/ & signup/            # Clerk auth pages
│   ├── dashboard/
│   │   ├── layout.tsx                   # Auth gate + subscription gate
│   │   ├── page.tsx                     # Dashboard stats
│   │   ├── inspections/
│   │   │   ├── page.tsx                 # Inspection list
│   │   │   ├── new/                     # New inspection wizard
│   │   │   └── [id]/                    # Inspection editor + AI
│   │   ├── reports/                     # PDF preview + download + share
│   │   └── settings/                   # Profile + Stripe billing
│   ├── admin/
│   │   ├── login/                       # Password-protected admin login
│   │   └── page.tsx                     # Admin dashboard
│   ├── report/[token]/                  # Public share page (no auth)
│   └── api/
│       ├── ai/generate-narrative/       # Claude AI narrative generation
│       ├── upload/                      # Cloudinary signed upload
│       ├── inspections/ (CRUD)
│       ├── reports/[id]/share/          # Share token generation
│       ├── profile/                     # Profile read/update
│       ├── admin/auth/                  # Admin cookie auth
│       ├── admin/seed-demo/             # Demo data seeder
│       └── stripe/ (checkout + webhook)
├── components/
│   ├── landing/AnimatedLanding.tsx      # Full landing page w/ animations
│   ├── layout/DashboardNav.tsx          # Sidebar navigation
│   ├── inspection/PhotoUploader.tsx     # Drag-drop photo upload
│   └── report/PDFReport.tsx            # react-pdf document (cover + summary + detail)
├── lib/
│   ├── db/
│   │   ├── index.ts                     # Neon + Drizzle connection
│   │   └── schema.ts                    # Database schema
│   ├── auth.ts                          # getProfile() helper
│   ├── inspection-templates.ts          # 15 InterNACHI room templates
│   └── demo-seed.ts                     # 5 demo inspection datasets
└── types/index.ts                       # TypeScript interfaces
```

**Database Tables:**
- `profiles` — one per Clerk user, stores inspector info + Stripe subscription status
- `inspections` — one per job, linked to a profile
- `rooms` — multiple per inspection (from InterNACHI templates)
- `inspection_items` — multiple per room, with condition + notes + AI narrative
- `reports` — one per inspection, stores the share token

---

## How the AI Works

When an inspector clicks "Generate" on a room:
1. The app sends room name + all items (names, conditions, notes) to `/api/ai/generate-narrative`
2. Claude claude-opus-4-6 writes a professional 2-3 paragraph narrative based on the findings
3. The narrative is saved to all items in that room in Neon
4. It appears in the PDF and on the share page

**To change the AI prompt:** Edit `src/app/api/ai/generate-narrative/route.ts`

**To reduce AI costs:** Change `claude-opus-4-6` to `claude-haiku-4-5-20251001` in that same file — 10x cheaper, slightly less nuanced prose.

---

## Growth Roadmap (What to Build Next)

These are the highest-leverage features to add after acquisition:

1. **Client email delivery** — Auto-email the PDF report to the client when the inspection is marked complete. Use Resend (free tier). ~2 hours of work, huge stickiness boost.

2. **Inspection scheduling** — Add a date picker + calendar view for upcoming inspections. Integrate with Google Calendar API. Makes it a full business management tool.

3. **Photo-in-PDF** — Embed Cloudinary photos directly into the PDF report next to the relevant item. The infrastructure (Cloudinary) is already in place.

4. **Team accounts** — Let inspection companies add multiple inspectors under one account. Charge $149/month for team tier. Drizzle schema already supports this with minor changes.

5. **Mobile PWA** — Add a `manifest.json` and service worker for offline-first field use. Inspectors work in basements and crawlspaces with no signal.

6. **Zapier integration** — Connect to realtor CRMs. Every completed inspection triggers a Zap. This is a major distribution channel.

7. **White-label** — Let agencies run InspectIQ under their own brand. Charge $299/month.

---

## Marketing Map

### Highest-ROI Channels

**Facebook Groups (free, immediate):**
- "Home Inspectors" (47k members)
- "InterNACHI Members" (official group)
- "ASHI Home Inspectors" (official group)
- "Home Inspector Marketing & Business Tips"
- State-specific groups (search "[State] Home Inspectors")

**Reddit:**
- r/HomeInspectors
- r/realestateinvesting (inspectors participate here)

**LinkedIn:**
- Search "home inspector" + connect + send: _"Hey [Name], I built a tool that writes your inspection reports with AI in under 10 minutes. Free 14-day trial — want me to send you access?"_

**InterNACHI:**
- List in the InterNACHI vendor directory (inspectors trust InterNACHI-affiliated tools)
- Sponsor the weekly InterNACHI newsletter

**Realtor outreach (indirect channel):**
- Realtors recommend inspectors to buyers
- A faster, more professional report = the realtor looks good too
- Target: Facebook groups for real estate agents, offer co-marketing

### Cold Email Templates

**Template 1 — Direct inspector outreach:**
```
Subject: Cut your report writing from 3 hours to 20 minutes

Hey [Name],

I built InspectIQ — it takes your room-by-room notes and writes a professional,
branded PDF report automatically using AI.

InterNACHI standards pre-loaded. Your logo, license number, and contact info
on every report. Share a link or download a PDF.

Free 14-day trial, no credit card required until day 15.

Worth a look? → [your-domain.com]

[Your name]
```

**Template 2 — Realtor partnership:**
```
Subject: Your clients will get their inspection report faster

Hi [Name],

The inspectors your clients use typically take 24-48 hours to deliver their report.

InspectIQ lets inspectors deliver a professional, branded PDF the same day.
Faster reports = smoother closings = happier clients.

If you refer inspectors to InspectIQ, I'll set you up with a referral link.

Worth a quick call? → [your-domain.com]
```

**Template 3 — Conference follow-up:**
```
Subject: Great meeting you at [conference name]

Hey [Name],

Great connecting at [conference].

As I mentioned, InspectIQ generates professional home inspection reports with AI.
Your notes in → branded PDF out, in under 10 minutes.

Here's your free trial link: [your-domain.com/auth/signup]

Let me know if you have any questions.
```

---

## Pricing Strategy

Current: **$99/month**

**Recommended path:**
- Launch at $99/month (competitive with ISN, HomeGauge, Spectora — all $99-$149)
- Once you hit 25 paying users, raise to $129/month (grandfather existing users)
- At 50 users, introduce a **Team plan at $249/month** (up to 5 inspectors)
- Annually: offer $79/month billed yearly (saves inspector $240/year, improves your cash flow)

**Comparable tools in the market:**
- Spectora: $99-$249/month
- HomeGauge: $99/month
- ISN (Inspection Support Network): $79-$199/month
- Palm-Tech: $99/month

InspectIQ competes on AI narrative generation — none of the above have it.

---

For setup questions during transfer, contact the seller via Flippa messaging.
