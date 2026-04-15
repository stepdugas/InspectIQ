import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const getCustomerId = (obj: { customer?: string | Stripe.Customer | Stripe.DeletedCustomer | null }) =>
    typeof obj.customer === 'string' ? obj.customer : obj.customer?.id

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = getCustomerId(sub)
      if (customerId) {
        await db.update(profiles)
          .set({ stripeSubscriptionId: sub.id, subscriptionStatus: sub.status })
          .where(eq(profiles.stripeCustomerId, customerId))
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = getCustomerId(sub)
      if (customerId) {
        await db.update(profiles)
          .set({ stripeSubscriptionId: null, subscriptionStatus: 'inactive' })
          .where(eq(profiles.stripeCustomerId, customerId))
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
