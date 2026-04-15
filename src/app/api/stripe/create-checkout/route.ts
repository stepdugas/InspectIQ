import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { getProfile } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await getProfile()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

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

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    subscription_data: { trial_period_days: 14 },
  })

  return NextResponse.json({ url: session.url })
}
