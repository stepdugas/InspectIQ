import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })

// POST /api/stripe/connect — start Stripe Connect onboarding
export async function POST(_request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId))
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  let accountId = profile.stripeConnectAccountId

  // Create a Connect account if one doesn't exist yet
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: profile.email,
      metadata: { userId },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: profile.companyName ?? profile.fullName ?? undefined,
        product_description: 'Home inspection services',
      },
    })
    accountId = account.id

    await db.update(profiles)
      .set({ stripeConnectAccountId: accountId })
      .where(eq(profiles.id, userId))
  }

  // Create an Account Link to send them through onboarding
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/dashboard/settings?stripe_connect=refresh`,
    return_url: `${baseUrl}/dashboard/settings?stripe_connect=complete`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}

// GET /api/stripe/connect — check Connect account status
export async function GET(_request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId))
  if (!profile?.stripeConnectAccountId) {
    return NextResponse.json({ connected: false, onboarded: false })
  }

  // Check current account status from Stripe
  const account = await stripe.accounts.retrieve(profile.stripeConnectAccountId)
  const onboarded = account.charges_enabled && account.payouts_enabled

  // Update DB if onboarding just completed
  if (onboarded && !profile.stripeConnectOnboarded) {
    await db.update(profiles)
      .set({ stripeConnectOnboarded: true })
      .where(eq(profiles.id, userId))
  }

  return NextResponse.json({
    connected: true,
    onboarded,
    accountId: profile.stripeConnectAccountId,
  })
}
