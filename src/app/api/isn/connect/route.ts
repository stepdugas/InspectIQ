import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { verifyIsnCredentials } from '@/lib/isn'
import { encrypt } from '@/lib/crypto'

// POST /api/isn/connect — verify ISN credentials and save them to the user's profile
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { companyKey, username, password, domain } = await request.json()
  if (!companyKey || !username || !password) {
    return NextResponse.json({ error: 'Company key, username, and password are required' }, { status: 400 })
  }

  try {
    // Build URL from domain + companyKey (domain defaults to inspectionsupport.net)
    const { isnUrl, me } = await verifyIsnCredentials(companyKey, username, password, domain || undefined)

    await db.update(profiles)
      .set({ isnCompanyKey: companyKey, isnUsername: username, isnPassword: encrypt(password), isnBaseUrl: isnUrl })
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
