import { NextResponse } from 'next/server'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { sendTrialMidpointEmail, sendTrialExpiringEmail } from '@/lib/email'

// Called daily by Vercel Cron — sends trial nudge emails at day 7 and day 13
export async function GET(request: Request) {
  // Protect the cron endpoint
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allTrialing = await db.select().from(profiles).where(eq(profiles.subscriptionStatus, 'trialing'))

  const now = new Date()
  let midpointSent = 0
  let expiringSent = 0

  for (const profile of allTrialing) {
    if (!profile.trialEndsAt) continue
    const trialEnd = new Date(profile.trialEndsAt)
    const daysLeft = Math.round((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const firstName = profile.fullName?.split(' ')[0] ?? ''

    if (daysLeft === 7) {
      await sendTrialMidpointEmail(profile.email, firstName).catch(() => {})
      midpointSent++
    } else if (daysLeft === 1) {
      await sendTrialExpiringEmail(profile.email, firstName).catch(() => {})
      expiringSent++
    }
  }

  return NextResponse.json({ ok: true, midpointSent, expiringSent })
}
