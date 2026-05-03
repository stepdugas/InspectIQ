import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, profiles, inspections } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { createIsnClient } from '@/lib/isn'
import { decrypt, isEncrypted } from '@/lib/crypto'

// POST /api/isn/push-report/[id]
// Receives the PDF blob from the client and uploads it to the linked ISN order
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)
  if (!profile?.isnBaseUrl || !profile?.isnUsername || !profile?.isnPassword) {
    return NextResponse.json({ error: 'ISN not connected' }, { status: 400 })
  }

  const [inspection] = await db.select().from(inspections)
    .where(and(eq(inspections.id, id), eq(inspections.userId, userId)))
    .limit(1)
  if (!inspection) return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
  if (!inspection.isnOrderId) {
    return NextResponse.json({ error: 'This inspection is not linked to an ISN order' }, { status: 400 })
  }

  const formData = await request.formData()
  const pdfFile = formData.get('pdf') as File | null
  if (!pdfFile) return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })

  try {
    const password = isEncrypted(profile.isnPassword) ? decrypt(profile.isnPassword) : profile.isnPassword
    const client = createIsnClient(profile.isnBaseUrl, profile.isnUsername, password)
    const pdfBlob = new Blob([await pdfFile.arrayBuffer()], { type: 'application/pdf' })
    const filename = `InspectIQ_${inspection.propertyAddress.replace(/[^a-z0-9]/gi, '_')}.pdf`
    await client.uploadReport(inspection.isnOrderId, pdfBlob, filename)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
