import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { getProfile } from '@/lib/auth'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profile = await getProfile()
  return NextResponse.json({ profile })
}

export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { fullName, companyName, licenseNumber, phone } = body

  await db.update(profiles)
    .set({ fullName, companyName, licenseNumber, phone })
    .where(eq(profiles.id, userId))

  return NextResponse.json({ ok: true })
}
