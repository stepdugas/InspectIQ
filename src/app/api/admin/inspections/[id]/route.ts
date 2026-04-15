import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, inspections, adminSettings } from '@/lib/db'
import { eq } from 'drizzle-orm'

async function isAuthenticated() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_auth')?.value
  if (!token) return false
  const fallback = process.env.ADMIN_PASSWORD ?? 'changeme'
  try {
    const [row] = await db.select().from(adminSettings).where(eq(adminSettings.key, 'admin_password')).limit(1)
    return token === (row?.value ?? fallback)
  } catch {
    return token === fallback
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await db.delete(inspections).where(eq(inspections.id, id))
  return NextResponse.json({ ok: true })
}
