import { cookies } from 'next/headers'
import { db, adminSettings } from '@/lib/db'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// Get or create a cookie signing secret — stored in DB, no env var needed
async function getCookieSecret(): Promise<string> {
  try {
    const [row] = await db.select().from(adminSettings).where(eq(adminSettings.key, 'cookie_secret')).limit(1)
    if (row?.value) return row.value
  } catch {
    // table might not exist yet on first run
  }

  // Generate and persist a new secret
  const secret = crypto.randomBytes(32).toString('hex')
  try {
    await db.insert(adminSettings)
      .values({ key: 'cookie_secret', value: secret, updatedAt: new Date() })
      .onConflictDoUpdate({ target: adminSettings.key, set: { value: secret, updatedAt: new Date() } })
  } catch {
    // If insert fails, secret still works for this session
  }
  return secret
}

function signToken(password: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(password).digest('hex')
}

// Check if admin has been set up yet (password exists in DB)
export async function isAdminSetUp(): Promise<boolean> {
  try {
    const [row] = await db.select().from(adminSettings).where(eq(adminSettings.key, 'admin_password')).limit(1)
    return !!row?.value
  } catch {
    return false
  }
}

// Get the admin email (stored in DB, falls back to env, falls back to default)
export async function getAdminEmail(): Promise<string> {
  try {
    const [row] = await db.select().from(adminSettings).where(eq(adminSettings.key, 'admin_email')).limit(1)
    if (row?.value) return row.value
  } catch {
    // fall through
  }
  return process.env.ADMIN_EMAIL ?? 'admin@useinspectiq.com'
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_auth')?.value
  if (!token) return false

  try {
    const [row] = await db.select().from(adminSettings).where(eq(adminSettings.key, 'admin_auth_token')).limit(1)
    if (row?.value) return token === row.value
  } catch {
    // fall through
  }
  return false
}

export async function setAdminCookie(password: string): Promise<void> {
  const secret = await getCookieSecret()
  const token = signToken(password, secret)
  const cookieStore = await cookies()
  cookieStore.set('admin_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  // Persist the token so isAdminAuthenticated can verify without the plaintext
  try {
    await db.insert(adminSettings)
      .values({ key: 'admin_auth_token', value: token, updatedAt: new Date() })
      .onConflictDoUpdate({ target: adminSettings.key, set: { value: token, updatedAt: new Date() } })
  } catch {
    // Non-fatal
  }
}

// First-time setup: set email + password
export async function setupAdmin(email: string, password: string): Promise<void> {
  const hashed = await bcrypt.hash(password, 12)
  await db.insert(adminSettings)
    .values({ key: 'admin_email', value: email, updatedAt: new Date() })
    .onConflictDoUpdate({ target: adminSettings.key, set: { value: email, updatedAt: new Date() } })
  await db.insert(adminSettings)
    .values({ key: 'admin_password', value: hashed, updatedAt: new Date() })
    .onConflictDoUpdate({ target: adminSettings.key, set: { value: hashed, updatedAt: new Date() } })
}

export async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  const adminEmail = await getAdminEmail()
  if (email !== adminEmail) return false

  let stored: string | null = null
  try {
    const [row] = await db.select().from(adminSettings).where(eq(adminSettings.key, 'admin_password')).limit(1)
    stored = row?.value ?? null
  } catch {
    // fall through
  }

  // Fallback to env var if DB has nothing (legacy support)
  if (!stored) stored = process.env.ADMIN_PASSWORD ?? null
  if (!stored) return false

  // bcrypt hash
  if (stored.startsWith('$2')) {
    return bcrypt.compare(password, stored)
  }

  // Plaintext (legacy) — auto-migrate to bcrypt
  if (password === stored) {
    const hashed = await bcrypt.hash(password, 12)
    try {
      await db.insert(adminSettings)
        .values({ key: 'admin_password', value: hashed, updatedAt: new Date() })
        .onConflictDoUpdate({ target: adminSettings.key, set: { value: hashed, updatedAt: new Date() } })
    } catch {
      // Non-fatal
    }
    return true
  }

  return false
}
