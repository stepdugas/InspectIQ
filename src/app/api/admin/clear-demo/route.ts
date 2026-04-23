import { NextResponse } from 'next/server'
import { db, inspections, profiles } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { eq } from 'drizzle-orm'

export async function DELETE() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminEmail = process.env.ADMIN_EMAIL ?? ''
  const [adminProfile] = await db.select().from(profiles).where(eq(profiles.email, adminEmail)).limit(1)
  if (!adminProfile) return NextResponse.json({ error: 'Admin profile not found' }, { status: 400 })

  // Delete all inspections for admin user — rooms/items/reports cascade automatically
  const deleted = await db.delete(inspections).where(eq(inspections.userId, adminProfile.id)).returning()

  return NextResponse.json({ deleted: deleted.length, message: `${deleted.length} inspections cleared` })
}
