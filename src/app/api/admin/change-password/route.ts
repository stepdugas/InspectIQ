import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, adminSettings } from '@/lib/db'
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

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { newPassword } = await req.json()
  if (!newPassword || newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  await db.insert(adminSettings)
    .values({ key: 'admin_password', value: newPassword, updatedAt: new Date() })
    .onConflictDoUpdate({ target: adminSettings.key, set: { value: newPassword, updatedAt: new Date() } })

  // Update the session cookie to the new password
  const cookieStore = await cookies()
  cookieStore.set('admin_auth', newPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
