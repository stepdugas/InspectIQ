import { NextResponse } from 'next/server'
import { verifyAdminPassword, setAdminCookie } from '@/lib/admin-auth'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!(await verifyAdminPassword(email, password))) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  await setAdminCookie(password)
  return NextResponse.json({ ok: true })
}
