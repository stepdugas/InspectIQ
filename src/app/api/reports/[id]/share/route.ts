import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, reports } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import crypto from 'crypto'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const existing = await db.select().from(reports).where(
    and(eq(reports.inspectionId, id), eq(reports.userId, userId))
  ).limit(1)

  let token = existing[0]?.shareToken

  if (!token) {
    token = crypto.randomBytes(16).toString('hex')
    await db.insert(reports).values({ inspectionId: id, userId, shareToken: token })
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://useinspectiq.com'}/report/${token}`
  return NextResponse.json({ shareUrl })
}
