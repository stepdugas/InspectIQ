export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db, inspections, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'
import AgreementForm from './AgreementForm'

export const metadata: Metadata = {
  title: 'Pre-Inspection Agreement',
  robots: { index: false },
}

export default async function AgreementPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [inspection] = await db.select().from(inspections)
    .where(eq(inspections.agreementToken, token)).limit(1)

  if (!inspection) notFound()

  const [profile] = await db.select().from(profiles)
    .where(eq(profiles.id, inspection.userId)).limit(1)

  const companyName = profile?.companyName ?? profile?.fullName ?? 'Inspector'
  const alreadySigned = !!inspection.agreementSignedAt

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">IQ</span>
          </div>
          <span className="font-bold text-slate-900">InspectIQ</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Pre-Inspection Agreement</h1>
          <p className="text-sm text-slate-500 mb-4">Please review and sign before the inspection.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Inspector</p>
              <p className="text-sm font-medium text-slate-900">{companyName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Property</p>
              <p className="text-sm font-medium text-slate-900">{inspection.propertyAddress}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Inspection Date</p>
              <p className="text-sm font-medium text-slate-900">{inspection.inspectionDate}</p>
            </div>
          </div>

          {/* Agreement text — simplified InterNACHI standard */}
          <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed mb-6 p-4 bg-slate-50 rounded-xl max-h-80 overflow-y-auto border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mt-0">Inspection Agreement</h3>
            <p>
              This agreement is between <strong>{companyName}</strong> (&quot;Inspector&quot;) and <strong>{inspection.clientName}</strong> (&quot;Client&quot;) for a visual inspection of the property located at <strong>{inspection.propertyAddress}</strong>.
            </p>
            <p>
              <strong>Scope of Inspection:</strong> The inspection is a non-invasive, visual examination of the accessible areas of the property at the time of the inspection. The inspection is limited to visual observation of accessible areas and is performed in accordance with the InterNACHI Standards of Practice.
            </p>
            <p>
              <strong>Limitations:</strong> The Inspector is not required to move personal property, furniture, equipment, plants, soil, snow, ice, or debris. The Inspector does not perform destructive testing, dismantle systems or components, or enter areas that are unsafe or inaccessible.
            </p>
            <p>
              <strong>Not Included:</strong> This inspection does not include testing for environmental hazards such as mold, radon, lead paint, asbestos, or other potentially hazardous materials unless separately contracted. The inspection does not include pest/termite inspections, pool/spa inspections, or geological evaluations unless separately contracted.
            </p>
            <p>
              <strong>Report:</strong> A written report will be provided to the Client following the inspection. The report is the exclusive property of the Client and Inspector. The Inspector&apos;s liability is limited to the fee paid for the inspection.
            </p>
            <p>
              <strong>Disclaimer:</strong> The inspection is not a guarantee or warranty, expressed or implied, regarding the condition of the property. The inspection does not cover the remaining life of any component or system. The Client understands that the Inspector cannot reveal every concealed defect, and the inspection is not technically exhaustive.
            </p>
            <p>
              By signing below, the Client acknowledges they have read, understood, and agree to the terms of this pre-inspection agreement.
            </p>
          </div>

          {/* Signing section */}
          {alreadySigned ? (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
              <p className="text-green-700 font-semibold">Agreement Signed</p>
              <p className="text-sm text-green-600 mt-1">
                Signed by {inspection.agreementSignerName} on{' '}
                {new Date(inspection.agreementSignedAt!).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
                })}
              </p>
            </div>
          ) : (
            <AgreementForm token={token} />
          )}
        </div>
      </div>
    </div>
  )
}
