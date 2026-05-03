import { NextResponse } from 'next/server'
import { db, inspections } from '@/lib/db'
import { eq } from 'drizzle-orm'

// POST /api/agreement/[token]/sign
// Public route — client signs the pre-inspection agreement (no auth needed).
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const { signerName } = await request.json()

  if (!signerName || typeof signerName !== 'string' || signerName.trim().length === 0) {
    return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
  }

  // Look up inspection by agreement token
  const [inspection] = await db.select().from(inspections)
    .where(eq(inspections.agreementToken, token)).limit(1)

  if (!inspection) {
    return NextResponse.json({ error: 'Invalid or expired agreement link' }, { status: 404 })
  }

  if (inspection.agreementSignedAt) {
    return NextResponse.json({ error: 'Agreement has already been signed' }, { status: 400 })
  }

  // Get client IP from request headers
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'

  await db.update(inspections)
    .set({
      agreementSignedAt: new Date(),
      agreementSignerName: signerName.trim(),
      agreementSignerIp: ip,
    })
    .where(eq(inspections.id, inspection.id))

  console.log(`[InspectIQ] Agreement signed by "${signerName.trim()}" for inspection ${inspection.id}`)

  return NextResponse.json({ ok: true })
}
