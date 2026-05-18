import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, connectedAccounts } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

const VALID_PROVIDERS = ['google', 'microsoft'] as const

// GET /api/connectors — list all connected accounts for this user
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const accounts = await db.select({
    id: connectedAccounts.id,
    provider: connectedAccounts.provider,
    email: connectedAccounts.email,
    scopes: connectedAccounts.scopes,
    createdAt: connectedAccounts.createdAt,
  }).from(connectedAccounts).where(eq(connectedAccounts.userId, userId))

  // Build a status map for the frontend
  const connectors = VALID_PROVIDERS.map(provider => {
    const account = accounts.find(a => a.provider === provider)
    return {
      provider,
      connected: !!account,
      email: account?.email ?? null,
      scopes: account?.scopes?.split(',') ?? [],
      connectedAt: account?.createdAt ?? null,
    }
  })

  return NextResponse.json({ connectors })
}

// DELETE /api/connectors — disconnect a provider
export async function DELETE(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { provider } = await request.json()
  if (!VALID_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  }

  await db.delete(connectedAccounts).where(
    and(eq(connectedAccounts.userId, userId), eq(connectedAccounts.provider, provider))
  )

  return NextResponse.json({ ok: true })
}
