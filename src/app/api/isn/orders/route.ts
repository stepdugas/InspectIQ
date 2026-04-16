import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { createIsnClient } from '@/lib/isn'

// GET /api/isn/orders — fetch recent orders from this user's ISN account
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)

  if (!profile?.isnBaseUrl || !profile?.isnUsername || !profile?.isnPassword) {
    return NextResponse.json({ error: 'ISN not connected' }, { status: 400 })
  }

  try {
    const client = createIsnClient(profile.isnBaseUrl, profile.isnUsername, profile.isnPassword)
    const data = await client.orders(50) as { orders?: unknown[] } | unknown[]
    // ISN may return { orders: [...] } or a top-level array depending on version
    const orders = Array.isArray(data) ? data : (data as { orders?: unknown[] }).orders ?? []
    return NextResponse.json({ orders })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
