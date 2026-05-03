import { NextResponse } from 'next/server'
import { db, profiles } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { eq } from 'drizzle-orm'

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId } = await params
  const { subscriptionStatus } = await request.json()

  const allowedStatuses = ['active', 'trialing', 'canceled', 'past_due', 'inactive']
  if (!subscriptionStatus || !allowedStatuses.includes(subscriptionStatus)) {
    return NextResponse.json({ error: `subscriptionStatus must be one of: ${allowedStatuses.join(', ')}` }, { status: 400 })
  }

  await db.update(profiles).set({ subscriptionStatus }).where(eq(profiles.id, userId))
  return NextResponse.json({ ok: true })
}
