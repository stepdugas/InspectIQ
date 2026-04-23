import { NextResponse } from 'next/server'
import { isAdminAuthenticated, setAdminCookie } from '@/lib/admin-auth'
import { db, adminSettings } from '@/lib/db'

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { newPassword } = await req.json()
  if (!newPassword || newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  await db.insert(adminSettings)
    .values({ key: 'admin_password', value: newPassword, updatedAt: new Date() })
    .onConflictDoUpdate({ target: adminSettings.key, set: { value: newPassword, updatedAt: new Date() } })

  // Refresh the session cookie with the new password's signature
  await setAdminCookie(newPassword)

  return NextResponse.json({ ok: true })
}
