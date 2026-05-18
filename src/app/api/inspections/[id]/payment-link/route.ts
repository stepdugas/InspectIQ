import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { db, inspections, profiles } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })

// POST /api/inspections/[id]/payment-link
// Creates a Stripe Checkout Session for the inspector to share with their client.
// Payment goes to the inspector's connected Stripe account via Connect.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { feeInCents } = await request.json()

  if (!feeInCents || feeInCents < 100) {
    return NextResponse.json({ error: 'Fee must be at least $1.00' }, { status: 400 })
  }

  // Verify inspection belongs to this user
  const [inspection] = await db
    .select()
    .from(inspections)
    .where(and(eq(inspections.id, id), eq(inspections.userId, userId)))

  if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get inspector profile — need Connect account for payment routing
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId))

  if (!profile?.stripeConnectAccountId || !profile?.stripeConnectOnboarded) {
    return NextResponse.json({ error: 'stripe_connect_required' }, { status: 400 })
  }

  const inspectorName = profile.companyName ?? profile.fullName ?? 'Your Inspector'
  const { APP_URL: baseUrl } = await import('@/lib/config')

  // Platform fee: 3% of the inspection fee
  const platformFee = Math.round(feeInCents * 0.03)

  // Create a one-time Stripe Checkout Session with Connect destination charge
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: feeInCents,
        product_data: {
          name: `Home Inspection — ${inspection.propertyAddress}`,
          description: `Inspection by ${inspectorName}`,
        },
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: profile.stripeConnectAccountId,
      },
    },
    customer_email: inspection.clientEmail ?? undefined,
    success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/payment-cancelled`,
    metadata: {
      inspectionId: id,
      inspectorUserId: userId,
    },
  })

  // Store session ID and fee in DB
  await db
    .update(inspections)
    .set({ inspectionFee: feeInCents, paymentStatus: 'pending', paymentSessionId: session.id, paymentCheckoutUrl: session.url })
    .where(eq(inspections.id, id))

  return NextResponse.json({ paymentUrl: session.url })
}
