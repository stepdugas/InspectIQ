import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, inspections, profiles, adminSettings } from '@/lib/db'
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

export async function DELETE() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminEmail = process.env.ADMIN_EMAIL ?? ''
  const [adminProfile] = await db.select().from(profiles).where(eq(profiles.email, adminEmail)).limit(1)
  if (!adminProfile) return NextResponse.json({ error: 'Admin profile not found' }, { status: 400 })

  // Delete all inspections for admin user — rooms/items/reports cascade automatically
  const deleted = await db.delete(inspections).where(eq(inspections.userId, adminProfile.id)).returning()

  return NextResponse.json({ deleted: deleted.length, message: `${deleted.length} inspections cleared` })
}
