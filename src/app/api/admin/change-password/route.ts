import { NextResponse } from 'next/server'
import { isAdminAuthenticated, setAdminCookie } from '@/lib/admin-auth'
import { db, adminSettings } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { newPassword } = await req.json()
  if (!newPassword || newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  // Store the password as a bcrypt hash
  const hashed = await bcrypt.hash(newPassword, 12)
  await db.insert(adminSettings)
    .values({ key: 'admin_password', value: hashed, updatedAt: new Date() })
    .onConflictDoUpdate({ target: adminSettings.key, set: { value: hashed, updatedAt: new Date() } })

  // Refresh the session cookie with the new password's signature
  await setAdminCookie(newPassword)

  return NextResponse.json({ ok: true })
}
