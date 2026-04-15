# InspectIQ — Technical Handover Document

> For the new owner. Everything you need to understand, operate, and extend this codebase.

---

## Architecture at a Glance

```
Browser (Next.js Client Components)
    ↓
Next.js App Router (Vercel Edge/Lambda)
    ↓                    ↓                    ↓
Neon PostgreSQL     Anthropic Claude      Cloudinary
(via Drizzle ORM)   (AI narratives)      (photo storage)
    ↓
Clerk (auth)    Stripe (billing)
```

**Framework:** Next.js 16, App Router, TypeScript, Turbopack
**Hosting:** Vercel (free tier — zero cost at launch)
**Repo structure:** monorepo, single Next.js app, no separate backend

---

## Database (Neon + Drizzle ORM)

**Connection:** `DATABASE_URL` env var → `src/lib/db/index.ts`

The ORM is Drizzle. Schema lives in `src/lib/db/schema.ts`. To make schema changes:

```bash
# Edit schema.ts, then push to Neon:
DATABASE_URL="your_connection_string" npx drizzle-kit push
```

### Tables

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | One row per Clerk user — inspector info + billing | `id` (Clerk user ID), `subscription_status`, `stripe_customer_id` |
| `inspections` | One per job | `user_id`, `property_address`, `client_name`, `status` (draft/completed) |
| `rooms` | Multiple per inspection | `inspection_id`, `name`, `order_index` |
| `inspection_items` | Multiple per room | `room_id`, `condition` (good/fair/poor/na), `notes`, `ai_narrative`, `photos` (JSON array of Cloudinary URLs) |
| `reports` | One per completed inspection | `inspection_id`, `share_token` (public URL token), `pdf_url` |

### Condition values
- `good` → "Satisfactory" (green)
- `fair` → "Maintenance Needed" (amber)
- `poor` → "Critical" (red)
- `na` → "N/A" (hidden from PDF)

### Direct DB access (Neon)
Log in at [neon.tech](https://neon.tech) → your project → SQL Editor. Useful queries:

```sql
-- See all users and subscription status
SELECT email, subscription_status, created_at FROM profiles ORDER BY created_at DESC;

-- Unlock dashboard for a user (for testing)
UPDATE profiles SET subscription_status = 'trialing' WHERE email = 'user@example.com';

-- Count inspections per user
SELECT p.email, COUNT(i.id) as inspections
FROM profiles p LEFT JOIN inspections i ON i.user_id = p.id
GROUP BY p.email;
```

---

## Authentication (Clerk)

**Docs:** [clerk.com/docs](https://clerk.com/docs)

All auth is handled by Clerk. The app uses email sign-in.

**Key files:**
- `src/middleware.ts` — controls which routes are public vs. protected
- `src/lib/auth.ts` — `getProfile()` helper: gets Clerk user ID, fetches matching profile from DB
- `src/app/dashboard/layout.tsx` — subscription gate: non-active users see upgrade prompt

**Public routes** (no auth required):
- `/` (landing page)
- `/auth/login`, `/auth/signup`
- `/report/[token]` (client share page)
- `/admin/*` (separate cookie-based auth)
- `/api/stripe/webhook`

**To swap Clerk for a different auth provider:**
1. Replace `@clerk/nextjs` package
2. Update `src/middleware.ts` to use new provider's middleware
3. Update `src/lib/auth.ts` `getProfile()` to get user ID from new provider
4. Update `src/app/dashboard/layout.tsx` auth check

---

## AI Narrative Generation (Anthropic Claude)

**Endpoint:** `POST /api/ai/generate-narrative`
**File:** `src/app/api/ai/generate-narrative/route.ts`

When an inspector clicks "Generate" on a room, the app sends:
- Room name
- All items in that room (name, condition, notes)

Claude writes a 2–3 paragraph professional narrative in the style of a licensed home inspector.

**To change the model** (reduce costs ~10×):
```ts
// In src/app/api/ai/generate-narrative/route.ts
model: 'claude-haiku-4-5-20251001'  // instead of claude-opus-4-6
```

**To change the prompt style:** Edit the `messages` array in that same file.

**Cost estimate:**
- claude-opus-4-6: ~$0.015–0.03 per room narrative
- claude-haiku: ~$0.001–0.003 per room narrative
- Average inspection: 5–8 rooms = $0.075–$0.24 with Opus, $0.005–$0.024 with Haiku

---

## Photo Storage (Cloudinary)

**Flow:**
1. Inspector drops photo → browser compresses it (`browser-image-compression`)
2. App calls `POST /api/upload` → server signs a Cloudinary upload request
3. Browser uploads directly to Cloudinary (never through your server)
4. Cloudinary URL is returned → saved to `inspection_items.photos` as JSON array

**Uploader component:** `src/components/inspection/PhotoUploader.tsx`
**Sign endpoint:** `src/app/api/upload/route.ts`

Photos are stored at: `inspectiq/{inspectionId}/{itemId}/` in your Cloudinary account.

**To swap Cloudinary** for S3 or another provider:
1. Replace `src/app/api/upload/route.ts` to generate S3 presigned URLs
2. Update `PhotoUploader.tsx` to upload to S3 instead
3. No DB schema change needed (still just a JSON array of URLs)

---

## Billing (Stripe)

**Products:** One subscription product at $99/month, 14-day trial

**Key files:**
- `src/app/api/stripe/create-checkout/route.ts` — creates Stripe Checkout session
- `src/app/api/stripe/webhook/route.ts` — handles subscription events, updates `profiles.subscription_status`

**Subscription statuses stored in DB:**
- `trialing` — in trial period, full access
- `active` — paying customer, full access
- `past_due` / `canceled` — blocked by subscription gate

**Webhook events handled:**
- `customer.subscription.created` → set status to `trialing` or `active`
- `customer.subscription.updated` → update status
- `customer.subscription.deleted` → set status to `canceled`

**After deploying to a new domain:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` env var

**To change the price:**
1. Create a new price in Stripe Dashboard
2. Update `STRIPE_PRICE_ID` env var
3. Update the price displayed on the landing page (`src/components/landing/AnimatedLanding.tsx`)

---

## PDF Report Generation

**Library:** `@react-pdf/renderer` (client-side rendering)
**Component:** `src/components/report/PDFReport.tsx`
**Used in:** `src/app/dashboard/reports/page.tsx` (download button)

The PDF has three sections:
1. **Cover page** — dark header, property address, client info, stat boxes (Satisfactory/Maintenance/Critical counts)
2. **Summary of Findings** — only renders if there are fair/poor items; lists them with color-coded badges
3. **Room Detail** — per-room sections with condition badges, notes, AI narratives, and photos

**To add your logo to the PDF:**
```ts
// In PDFReport.tsx, import Image from @react-pdf/renderer (already imported)
// Add to cover page:
<Image src={profile.logoUrl} style={{ width: 80, height: 40, objectFit: 'contain' }} />
```

---

## Admin Dashboard

**URL:** `/admin/login`
**Auth:** Cookie-based password (separate from Clerk — anyone can use it without a Clerk account)

**Password:** Set via `ADMIN_PASSWORD` env var. Change in Vercel → Environment Variables → redeploy.

**Features:**
- Total users, active subscribers, trial users, MRR
- Users table with subscription status
- "Seed Demo Data" button — creates 5 pre-built inspections for the logged-in admin account

**Files:**
- `src/app/admin/page.tsx` — dashboard UI
- `src/app/admin/login/page.tsx` — login form
- `src/app/api/admin/auth/route.ts` — validates password, sets cookie
- `src/app/api/admin/seed-demo/route.ts` — creates demo inspections

---

## Environment Variables Reference

| Variable | Where to get it | Required |
|---|---|---|
| `DATABASE_URL` | Neon dashboard → Connection string | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys | Yes |
| `CLERK_SECRET_KEY` | Clerk dashboard → API Keys | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Set to `/auth/login` | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Set to `/auth/signup` | Yes |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard → Developers → API Keys | Yes |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API Keys | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks → signing secret | Yes |
| `STRIPE_PRICE_ID` | Stripe dashboard → Products → Price ID | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard | Yes |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL (e.g. `https://inspectiq.com`) | Yes |
| `ADMIN_PASSWORD` | Choose a secure password | Yes |
| `ADMIN_EMAILS` | Comma-separated emails that can seed demo data | Optional |

---

## Deployment (Vercel)

```bash
# First deploy
npx vercel --prod

# Add env vars (do this once per variable)
npx vercel env add VARIABLE_NAME

# Redeploy after code changes
npx vercel --prod
```

**Important:** Vercel free tier has a 10-second function timeout. All API routes in this app complete well within that limit.

---

## Domain Transfer (For New Owner After Acquisition)

The domain is registered separately from the codebase and transfers independently.

### What transfers with this sale
- GitHub repository (code)
- Domain name
- All third-party service accounts (or just the API keys — buyer's preference)

### How to transfer the domain

**Option A — Transfer to buyer's registrar (recommended)**
1. Seller logs into registrar (Namecheap / Cloudflare)
2. Unlock the domain and generate an **EPP/Auth transfer code**
3. Send the code to buyer
4. Buyer initiates transfer at their registrar using that code
5. Transfer completes in 5–7 days automatically

**Option B — Push within same registrar**
If buyer uses the same registrar (e.g. both on Namecheap), seller can "push" the domain to buyer's account instantly — no waiting period.

### After domain transfer, buyer needs to
1. Add domain to their Vercel project → Project → Settings → Domains
2. Point DNS to Vercel (Vercel provides the exact records)
3. Update `NEXT_PUBLIC_APP_URL` env var to the new domain
4. Update Stripe webhook URL to `https://yourdomain.com/api/stripe/webhook`
5. Create a Clerk production instance using the new domain

### Annual cost to maintain
- Domain: ~$10–14/year (Namecheap) or at-cost ~$8–10/year (Cloudflare Registrar)
- Vercel: $0 (free tier)
- Neon DB: $0 (free tier, up to 0.5GB)
- Clerk: $0 (free tier, up to 10,000 MAU)
- Cloudinary: $0 (free tier, 25GB storage)
- Anthropic: pay-per-use (~$0.01–0.03 per room narrative with Opus, ~$0.001 with Haiku)
- Stripe: 2.9% + $0.30 per transaction (no monthly fee)

**Total fixed cost to operate: ~$12/year. Everything else scales with revenue.**

---

## Key Customization Points

| What to change | Where |
|---|---|
| Price ($99/month) | `AnimatedLanding.tsx` + Stripe dashboard |
| AI prompt style | `src/app/api/ai/generate-narrative/route.ts` |
| Room inspection templates | `src/lib/inspection-templates.ts` |
| Brand name / domain | Search `inspectiq.app` across codebase |
| Support email | `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` |
| Admin password | `ADMIN_PASSWORD` env var |
| Trial length | Stripe dashboard → Product → Pricing → Trial period |

---

## How to Test End-to-End After Setup

1. Sign up at `/auth/signup` with your email
2. Run this SQL in Neon to unlock dashboard: `UPDATE profiles SET subscription_status = 'trialing' WHERE email = 'you@email.com';`
3. Log in → click Admin (shield icon, bottom-right) → Seed Demo Data
4. Go to `/dashboard/inspections` → open a demo inspection
5. Change item conditions → click "Generate All AI" to test AI narratives
6. Go to `/dashboard/reports` → download a PDF to verify PDF output
7. Copy the share link → open in incognito to verify client view works

---

*Built with Next.js 16, Neon, Clerk, Anthropic Claude, Stripe, Cloudinary.*
*For setup questions, review the README.md in the project root.*
