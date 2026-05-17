import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import crypto from 'crypto'
import { db, inspections, profiles } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { sendAgreementEmail } from '@/lib/email'

// POST /api/inspections/[id]/agreement/send
// Generates a unique agreement token, emails the client a link to sign the PIA.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [inspection] = await db.select().from(inspections)
    .where(and(eq(inspections.id, id), eq(inspections.userId, userId))).limit(1)

  if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!inspection.clientEmail) {
    return NextResponse.json({ error: 'Inspection has no client email' }, { status: 400 })
  }

  // Prevent re-sending within 5 minutes
  if (inspection.agreementSentAt) {
    const msSinceSent = Date.now() - new Date(inspection.agreementSentAt).getTime()
    if (msSinceSent < 5 * 60 * 1000) {
      return NextResponse.json({ error: 'Agreement was already sent recently. Please wait a few minutes.' }, { status: 429 })
    }
  }

  // Generate a unique token for the agreement signing link
  const agreementToken = crypto.randomBytes(32).toString('hex')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.useinspectiq.com'
  const agreementUrl = `${baseUrl}/agreement/${agreementToken}`

  // Save token and sent timestamp
  await db.update(inspections)
    .set({ agreementToken, agreementSentAt: new Date() })
    .where(eq(inspections.id, id))

  // Get inspector profile for company name
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId))
  const companyName = profile?.companyName ?? profile?.fullName ?? 'Your Inspector'

  // Send the agreement email
  await sendAgreementEmail(
    inspection.clientEmail,
    inspection.clientName,
    companyName,
    inspection.propertyAddress,
    agreementUrl,
  )

  console.log(`[InspectIQ] Agreement sent to ${inspection.clientEmail} for inspection ${id}`)

  return NextResponse.json({ ok: true, agreementSentAt: new Date().toISOString() })
}
