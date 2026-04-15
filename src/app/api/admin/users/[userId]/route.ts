import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'

async function isAuthenticated() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_auth')?.value
  return token === (process.env.ADMIN_PASSWORD ?? 'changeme')
}

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId } = await params
  const { subscriptionStatus } = await request.json()
  await db.update(profiles).set({ subscriptionStatus }).where(eq(profiles.id, userId))
  return NextResponse.json({ ok: true })
}
