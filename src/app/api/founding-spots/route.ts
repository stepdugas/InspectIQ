import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

const FOUNDING_MEMBER_LIMIT = 50

export const revalidate = 60 // cache 60s so it doesn't slam the DB on every page load

export async function GET() {
  const [row] = await db
    .select({ total: count() })
    .from(profiles)
    .where(eq(profiles.isFoundingMember, true))

  const taken = row?.total ?? 0
  const remaining = Math.max(0, FOUNDING_MEMBER_LIMIT - taken)

  return NextResponse.json({ remaining, taken, total: FOUNDING_MEMBER_LIMIT })
}
