import { NextResponse } from 'next/server'
import { verifyAdminPassword, setAdminCookie } from '@/lib/admin-auth'

// Rate limiter: max 5 login attempts per IP per 15 minutes
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 5
const loginAttempts = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = loginAttempts.get(ip) ?? []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    loginAttempts.set(ip, recent)
    return true
  }
  recent.push(now)
  loginAttempts.set(ip, recent)
  return false
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 15 minutes.' },
      { status: 429 },
    )
  }

  const { email, password } = await req.json()

  if (!(await verifyAdminPassword(email, password))) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  await setAdminCookie(password)
  return NextResponse.json({ ok: true })
}
