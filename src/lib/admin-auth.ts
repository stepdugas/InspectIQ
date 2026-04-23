import { cookies } from 'next/headers'
import { db, adminSettings } from '@/lib/db'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

// Sign the password so the cookie never contains the plaintext value
function signToken(password: string): string {
  const secret = process.env.ADMIN_COOKIE_SECRET ?? 'inspectiq-admin-secret'
  return crypto.createHmac('sha256', secret).update(password).digest('hex')
}

async function getAdminPassword(): Promise<string> {
  const fallback = process.env.ADMIN_PASSWORD ?? 'changeme'
  try {
    const [row] = await db.select().from(adminSettings).where(eq(adminSettings.key, 'admin_password')).limit(1)
    return row?.value ?? fallback
  } catch {
    return fallback
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_auth')?.value
  if (!token) return false
  const password = await getAdminPassword()
  return token === signToken(password)
}

export async function setAdminCookie(password: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('admin_auth', signToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@useinspectiq.com'
  if (email !== adminEmail) return false
  const stored = await getAdminPassword()
  return password === stored
}
