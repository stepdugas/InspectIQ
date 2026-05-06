import { NextResponse } from 'next/server'
import { db, reports, repairRequests, repairRequestItems, inspections, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { Resend } from 'resend'

// POST /api/report/[token]/repairs/submit — agent submits the repair list
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [report] = await db.select().from(reports)
    .where(eq(reports.shareToken, token)).limit(1)

  if (!report) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })

  const [repairRequest] = await db.select().from(repairRequests)
    .where(eq(repairRequests.reportId, report.id)).limit(1)

  if (!repairRequest) return NextResponse.json({ error: 'No repair request found' }, { status: 404 })

  if (repairRequest.status === 'submitted') {
    return NextResponse.json({ error: 'Repair request already submitted' }, { status: 400 })
  }

  // Check that at least one item is selected
  const items = await db.select().from(repairRequestItems)
    .where(eq(repairRequestItems.repairRequestId, repairRequest.id))

  const selectedItems = items.filter((i) => i.selected)
  if (selectedItems.length === 0) {
    return NextResponse.json({ error: 'Please select at least one item for repair' }, { status: 400 })
  }

  // Mark as submitted
  await db.update(repairRequests).set({
    status: 'submitted',
    submittedAt: new Date(),
  }).where(eq(repairRequests.id, repairRequest.id))

  // Send email notification to the inspector
  const [inspection] = await db.select().from(inspections)
    .where(eq(inspections.id, report.inspectionId)).limit(1)

  if (inspection) {
    const [profile] = await db.select().from(profiles)
      .where(eq(profiles.id, inspection.userId)).limit(1)

    if (profile?.email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
        await resend.emails.send({
          from: 'Stephanie at InspectIQ <stepdugas@gmail.com>',
          to: profile.email,
          subject: `Repair Request — ${inspection.propertyAddress}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
              <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
                <h1 style="color:#60a5fa;font-size:20px;margin:0">Repair Request Received</h1>
              </div>
              <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
                <h2 style="font-size:20px;margin:0 0 8px">${inspection.propertyAddress}</h2>
                <p style="color:#475569;line-height:1.6">
                  <strong>${repairRequest.createdBy ?? 'An agent'}</strong>${repairRequest.createdByRole ? ` (${repairRequest.createdByRole})` : ''} has submitted a repair request with <strong>${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}</strong>.
                </p>
                ${repairRequest.notes ? `<p style="color:#475569;line-height:1.6"><strong>Overall Notes:</strong><br/>${repairRequest.notes}</p>` : ''}
                ${repairRequest.createdByEmail ? `<p style="color:#475569;line-height:1.6">Contact: ${repairRequest.createdByEmail}</p>` : ''}
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/report/${token}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
                  View Report
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
                  Sent via InspectIQ · useinspectiq.com
                </p>
              </div>
            </div>
          `,
        })
      } catch (e) {
        console.error('Failed to send repair request email:', e)
      }
    }
  }

  console.log(`[InspectIQ] CRL submitted for report ${report.id} — ${selectedItems.length} items selected`)

  return NextResponse.json({ ok: true, status: 'submitted' })
}
