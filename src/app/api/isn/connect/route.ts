import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { verifyIsnCredentials, createIsnClient } from '@/lib/isn'

// POST /api/isn/connect — verify ISN credentials and save them to the user's profile
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { companyKey, username, password, baseUrl } = await request.json()
  if (!companyKey || !username || !password) {
    return NextResponse.json({ error: 'Company key, username, and password are required' }, { status: 400 })
  }

  try {
    let isnUrl: string
    let me: unknown

    const hasVendorCreds = !!(process.env.ISN_INTEGRATION_USER && process.env.ISN_INTEGRATION_PASS)

    if (hasVendorCreds) {
      // Auto-resolve the inspector's ISN URL via the ISN Admin API
      const result = await verifyIsnCredentials(companyKey, username, password)
      isnUrl = result.isnUrl
      me = result.me
    } else {
      // No vendor creds yet — use the URL the inspector provides directly
      if (!baseUrl) {
        return NextResponse.json({ error: 'Please provide your ISN base URL (e.g. https://yourcompany.inspectionsupport.net)' }, { status: 400 })
      }
      const cleanUrl = baseUrl.replace(/\/$/, '')
      const client = createIsnClient(cleanUrl, username, password)
      me = await client.me()
      isnUrl = cleanUrl
    }

    await db.update(profiles)
      .set({ isnCompanyKey: companyKey, isnUsername: username, isnPassword: password, isnBaseUrl: isnUrl })
      .where(eq(profiles.id, userId))

    return NextResponse.json({ ok: true, user: me })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
}

// DELETE /api/isn/connect — disconnect ISN from this account
export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.update(profiles)
    .set({ isnCompanyKey: null, isnUsername: null, isnPassword: null, isnBaseUrl: null })
    .where(eq(profiles.id, userId))

  return NextResponse.json({ ok: true })
}
