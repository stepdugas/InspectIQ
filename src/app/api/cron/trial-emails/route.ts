import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { db, profiles, inspections } from '@/lib/db'
import { eq, count, inArray } from 'drizzle-orm'
import { sendActivationEmail, sendTrialMidpointEmail, sendTrialExpiringEmail } from '@/lib/email'

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

// Called daily by Vercel Cron — sends trial nudge emails at day 2, day 7, and day 13
export async function GET(request: Request) {
  // Protect the cron endpoint with timing-safe comparison
  const authHeader = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!safeCompare(authHeader, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allTrialing = await db.select().from(profiles).where(eq(profiles.subscriptionStatus, 'trialing'))

  const now = new Date()
  let activationSent = 0
  let midpointSent = 0
  let expiringSent = 0

  // Identify day-2 candidates (daysLeft === 12) who need an inspection count check
  const day2Candidates = allTrialing.filter((p) => {
    if (!p.trialEndsAt) return false
    const daysLeft = Math.round((new Date(p.trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft === 12
  })

  // Batch-fetch inspection counts for all day-2 candidates in one query (N+1 fix)
  const inspectionCountByUserId = new Map<string, number>()
  if (day2Candidates.length > 0) {
    const candidateIds = day2Candidates.map((p) => p.id)
    const rows = await db
      .select({ userId: inspections.userId, total: count() })
      .from(inspections)
      .where(inArray(inspections.userId, candidateIds))
      .groupBy(inspections.userId)
    for (const row of rows) {
      inspectionCountByUserId.set(row.userId, row.total)
    }
  }

  for (const profile of allTrialing) {
    if (!profile.trialEndsAt) continue
    const trialEnd = new Date(profile.trialEndsAt)
    const daysLeft = Math.round((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const firstName = profile.fullName?.split(' ')[0] ?? ''

    if (daysLeft === 12) {
      // Day 2 — only send if they haven't created any inspections yet
      const total = inspectionCountByUserId.get(profile.id) ?? 0
      if (total === 0) {
        await sendActivationEmail(profile.email, firstName).catch(() => {})
        activationSent++
      }
    } else if (daysLeft === 7) {
      await sendTrialMidpointEmail(profile.email, firstName).catch(() => {})
      midpointSent++
    } else if (daysLeft === 1) {
      await sendTrialExpiringEmail(profile.email, firstName).catch(() => {})
      expiringSent++
    }
  }

  return NextResponse.json({ ok: true, activationSent, midpointSent, expiringSent })
}
