import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db, profiles, inspections } from '@/lib/db'
import { eq, count } from 'drizzle-orm'
import { sendReferralRewardEmail } from '@/lib/email'

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
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = getCustomerId(sub)
      if (customerId) {
        if (sub.metadata?.isFoundingMember === 'true') {
          // Count existing founding members to assign a sequential number
          const [row] = await db
            .select({ total: count() })
            .from(profiles)
            .where(eq(profiles.isFoundingMember, true))
          await db.update(profiles)
            .set({
              stripeSubscriptionId: sub.id,
              subscriptionStatus: sub.status,
              isFoundingMember: true,
              foundingMemberNumber: (row?.total ?? 0) + 1,
            })
            .where(eq(profiles.stripeCustomerId, customerId))
        } else {
          await db.update(profiles)
            .set({ stripeSubscriptionId: sub.id, subscriptionStatus: sub.status })
            .where(eq(profiles.stripeCustomerId, customerId))
        }
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = getCustomerId(sub)
      if (!customerId) break

      await db.update(profiles)
        .set({ stripeSubscriptionId: sub.id, subscriptionStatus: sub.status })
        .where(eq(profiles.stripeCustomerId, customerId))

      // When a trial converts to active, reward the referrer if there is one
      if (sub.status === 'active') {
        const [subscriber] = await db.select().from(profiles).where(eq(profiles.stripeCustomerId, customerId)).limit(1)
        if (subscriber?.referredBy && !subscriber.referralRewarded) {
          const [referrer] = await db.select().from(profiles).where(eq(profiles.id, subscriber.referredBy)).limit(1)
          if (referrer?.stripeCustomerId) {
            // Apply a $99 credit to the referrer's Stripe balance — comes off their next invoice automatically
            await stripe.customers.createBalanceTransaction(referrer.stripeCustomerId, {
              amount: -9900, // negative = credit
              currency: 'usd',
              description: `Referral reward — ${subscriber.email} subscribed`,
            })
            // Mark rewarded so we don't double-credit
            await db.update(profiles).set({ referralRewarded: true }).where(eq(profiles.id, subscriber.id))
            // Email the referrer
            sendReferralRewardEmail(referrer.email, referrer.fullName ?? '', subscriber.email).catch(() => {})
          }
        }
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

    // Client paid their inspector's fee
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const inspectionId = session.metadata?.inspectionId
      if (inspectionId && session.payment_status === 'paid') {
        await db.update(inspections)
          .set({ paymentStatus: 'paid' })
          .where(eq(inspections.id, inspectionId))
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
