import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { db, profiles } from '@/lib/db'
import { eq, count } from 'drizzle-orm'
import { getProfile } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })

const FOUNDING_MEMBER_LIMIT = 50

// STRIPE_FOUNDING_PRICE_ID should be a separate Price in Stripe at $99/month that you NEVER
// change or archive — this is how founding members stay at $99 forever even after you raise prices.
// Create it in Stripe dashboard → Products → Add Price → recurring $99/mo.
// If not set, falls back to STRIPE_PRICE_ID (same price for now, set this before raising prices).
const FOUNDING_PRICE_ID = process.env.STRIPE_FOUNDING_PRICE_ID ?? process.env.STRIPE_PRICE_ID!

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await getProfile()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const plan: 'monthly' | 'annual' = body.plan === 'annual' ? 'annual' : 'monthly'

  let customerId = profile.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      name: profile.fullName ?? undefined,
      metadata: { clerk_user_id: userId },
    })
    customerId = customer.id
    await db.update(profiles).set({ stripeCustomerId: customerId }).where(eq(profiles.id, userId))
  }

  let priceId: string

  if (plan === 'annual') {
    // Annual plan — no founding member logic (founding = monthly lock-in)
    priceId = process.env.STRIPE_ANNUAL_PRICE_ID ?? process.env.STRIPE_PRICE_ID!
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      subscription_data: { trial_period_days: 14 },
    })
    return NextResponse.json({ url: session.url })
  }

  // Monthly plan — check founding member eligibility
  const [row] = await db
    .select({ total: count() })
    .from(profiles)
    .where(eq(profiles.isFoundingMember, true))
  const foundingTaken = row?.total ?? 0
  const isFoundingSlotAvailable = foundingTaken < FOUNDING_MEMBER_LIMIT

  priceId = isFoundingSlotAvailable ? FOUNDING_PRICE_ID : process.env.STRIPE_PRICE_ID!

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    subscription_data: {
      trial_period_days: 14,
      metadata: { isFoundingMember: isFoundingSlotAvailable ? 'true' : 'false' },
    },
  })

  return NextResponse.json({ url: session.url })
}
