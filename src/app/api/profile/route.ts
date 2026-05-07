import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { getProfile } from '@/lib/auth'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profile = await getProfile()
  if (!profile) return NextResponse.json({ profile: null })

  // Strip sensitive fields the frontend doesn't need
  const { isnPassword, stripeSubscriptionId, referredBy, referralRewarded, trialEndsAt, ...safeProfile } = profile
  return NextResponse.json({ profile: safeProfile })
}

export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { fullName, companyName, licenseNumber, phone, inspectionState, defaultTemplateId } = body

  // Validate string types and length
  for (const [key, value] of Object.entries({ fullName, companyName, licenseNumber, phone, inspectionState, defaultTemplateId })) {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') {
        return NextResponse.json({ error: `${key} must be a string` }, { status: 400 })
      }
      if (value.length > 200) {
        return NextResponse.json({ error: `${key} must be 200 characters or fewer` }, { status: 400 })
      }
    }
  }

  await db.update(profiles)
    .set({ fullName, companyName, licenseNumber, phone, inspectionState: inspectionState ?? null, defaultTemplateId: defaultTemplateId ?? null })
    .where(eq(profiles.id, userId))

  return NextResponse.json({ ok: true })
}
