import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { db, profiles, inspections } from '@/lib/db'
import { eq, count, inArray, isNull } from 'drizzle-orm'
import { sendActivationEmail, sendReferralNudgeEmail, sendTrialMidpointEmail, sendListeningCallEmail, sendTrialExpiringEmail, sendTrialExpiredEmail } from '@/lib/email'
import { generateReferralCode } from '@/lib/auth'

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
  let referralSent = 0
  let midpointSent = 0
  let listeningSent = 0
  let expiringSent = 0
  let expiredSent = 0

  // Identify day-2 candidates (daysLeft === 12) who need an inspection count check
  // Day 2 and Day 14 candidates both need inspection counts
  const needsInspectionCount = allTrialing.filter((p) => {
    if (!p.trialEndsAt) return false
    const daysLeft = Math.round((new Date(p.trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft === 12 || daysLeft === 0 || daysLeft === -1
  })

  // Batch-fetch inspection counts for all day-2 candidates in one query (N+1 fix)
  const inspectionCountByUserId = new Map<string, number>()
  if (needsInspectionCount.length > 0) {
    const candidateIds = needsInspectionCount.map((p) => p.id)
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
    } else if (daysLeft === 9) {
      // Day 5 — referral nudge (auto-generate code if missing)
      let code = profile.referralCode
      if (!code) {
        code = generateReferralCode()
        await db.update(profiles).set({ referralCode: code }).where(eq(profiles.id, profile.id))
      }
      await sendReferralNudgeEmail(profile.email, firstName, code).catch(() => {})
      referralSent++
    } else if (daysLeft === 7) {
      await sendTrialMidpointEmail(profile.email, firstName).catch(() => {})
      midpointSent++
    } else if (daysLeft === 4) {
      // Day 10 — personal listening call offer
      await sendListeningCallEmail(profile.email, firstName).catch(() => {})
      listeningSent++
    } else if (daysLeft === 1) {
      await sendTrialExpiringEmail(profile.email, firstName).catch(() => {})
      expiringSent++
    } else if (daysLeft === 0 || daysLeft === -1) {
      // Day 14/15 — trial just expired, remind them their data is saved
      const total = inspectionCountByUserId.get(profile.id) ?? 0
      await sendTrialExpiredEmail(profile.email, firstName, total).catch(() => {})
      expiredSent++
    }
  }

  return NextResponse.json({ ok: true, activationSent, referralSent, midpointSent, listeningSent, expiringSent, expiredSent })
}
