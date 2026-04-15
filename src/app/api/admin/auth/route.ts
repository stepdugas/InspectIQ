import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, adminSettings } from '@/lib/db'
import { eq } from 'drizzle-orm'

async function getAdminCredentials() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@useinspectiq.com'
  const fallbackPassword = process.env.ADMIN_PASSWORD ?? 'changeme'
  try {
    const [row] = await db.select().from(adminSettings).where(eq(adminSettings.key, 'admin_password')).limit(1)
    return { email: adminEmail, password: row?.value ?? fallbackPassword }
  } catch {
    return { email: adminEmail, password: fallbackPassword }
  }
}

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const creds = await getAdminCredentials()

  if (email !== creds.email || password !== creds.password) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_auth', creds.password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
