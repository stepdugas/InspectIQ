import { cookies } from 'next/headers'
import { db, adminSettings } from '@/lib/db'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// Sign the password so the cookie never contains the plaintext value
function signToken(password: string): string {
  const secret = process.env.ADMIN_COOKIE_SECRET
  if (!secret) throw new Error('[admin-auth] ADMIN_COOKIE_SECRET is not set — configure it in environment variables')
  return crypto.createHmac('sha256', secret).update(password).digest('hex')
}

async function getStoredPassword(): Promise<string | null> {
  const fallback = process.env.ADMIN_PASSWORD ?? null
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
  // The cookie holds signToken(plaintext_password), so we recreate
  // that from the stored password. For bcrypt hashes we can't reverse,
  // so we compare the token against signToken of the stored hash itself
  // -- but that won't work. Instead, we store the HMAC token alongside
  // the hash. Simpler: the cookie is set at login time using the user's
  // plaintext input, so we just need to verify the HMAC matches. We
  // store the expected HMAC in a separate admin_settings key.
  try {
    const [row] = await db.select().from(adminSettings).where(eq(adminSettings.key, 'admin_auth_token')).limit(1)
    if (row?.value) return token === row.value
  } catch {
    // fall through to legacy check
  }
  // Legacy fallback: stored password is plaintext, compare HMAC directly
  const stored = await getStoredPassword()
  if (!stored) return false
  return token === signToken(stored)
}

export async function setAdminCookie(password: string): Promise<void> {
  const token = signToken(password)
  const cookieStore = await cookies()
  cookieStore.set('admin_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  // Persist the expected token so isAdminAuthenticated can verify
  // without needing the plaintext password (which is now bcrypt-hashed)
  try {
    await db.insert(adminSettings)
      .values({ key: 'admin_auth_token', value: token, updatedAt: new Date() })
      .onConflictDoUpdate({ target: adminSettings.key, set: { value: token, updatedAt: new Date() } })
  } catch {
    // Non-fatal: cookie still works for current session
  }
}

export async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@useinspectiq.com'
  if (email !== adminEmail) return false

  const stored = await getStoredPassword()
  if (!stored) return false // No password configured — login impossible

  // Try bcrypt comparison first (stored value is a hash)
  if (stored.startsWith('$2')) {
    const match = await bcrypt.compare(password, stored)
    return match
  }

  // Fallback: stored value is still plaintext (pre-migration)
  if (password === stored) {
    // Auto-migrate to bcrypt on successful plaintext login
    const hashed = await bcrypt.hash(password, 12)
    try {
      await db.insert(adminSettings)
        .values({ key: 'admin_password', value: hashed, updatedAt: new Date() })
        .onConflictDoUpdate({ target: adminSettings.key, set: { value: hashed, updatedAt: new Date() } })
      console.log('[admin-auth] Auto-migrated admin password to bcrypt')
    } catch {
      // Non-fatal: login still succeeds, migration will retry next time
    }
    return true
  }

  return false
}
