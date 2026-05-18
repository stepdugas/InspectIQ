import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, availabilityRules } from '@/lib/db'
import { eq } from 'drizzle-orm'

const DEFAULT_RULES = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', enabled: false }, // Sun
  { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', enabled: true },  // Mon
  { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', enabled: true },  // Tue
  { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', enabled: true },  // Wed
  { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', enabled: true },  // Thu
  { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', enabled: true },  // Fri
  { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', enabled: false }, // Sat
]

// GET /api/scheduling/availability — returns weekly availability rules
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let rules = await db.select().from(availabilityRules)
    .where(eq(availabilityRules.userId, userId))
    .orderBy(availabilityRules.dayOfWeek)

  // Create defaults if none exist
  if (rules.length === 0) {
    await db.insert(availabilityRules).values(
      DEFAULT_RULES.map(r => ({ ...r, userId }))
    )
    rules = await db.select().from(availabilityRules)
      .where(eq(availabilityRules.userId, userId))
      .orderBy(availabilityRules.dayOfWeek)
  }

  return NextResponse.json({ rules })
}

// PUT /api/scheduling/availability — update all rules at once
export async function PUT(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rules } = await request.json() as { rules: Array<{ dayOfWeek: number; startTime: string; endTime: string; enabled: boolean }> }

  if (!Array.isArray(rules) || rules.length !== 7) {
    return NextResponse.json({ error: 'Must provide exactly 7 rules (one per day)' }, { status: 400 })
  }

  // Validate time ranges
  for (const rule of rules) {
    if (!/^\d{2}:\d{2}$/.test(rule.startTime) || !/^\d{2}:\d{2}$/.test(rule.endTime)) {
      return NextResponse.json({ error: 'Times must be in HH:MM format' }, { status: 400 })
    }
    if (rule.enabled) {
      const [sH, sM] = rule.startTime.split(':').map(Number)
      const [eH, eM] = rule.endTime.split(':').map(Number)
      if (sH * 60 + sM >= eH * 60 + eM) {
        return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 })
      }
    }
  }

  // Delete existing and insert new
  await db.delete(availabilityRules).where(eq(availabilityRules.userId, userId))
  await db.insert(availabilityRules).values(
    rules.map(r => ({
      userId,
      dayOfWeek: r.dayOfWeek,
      startTime: r.startTime,
      endTime: r.endTime,
      enabled: r.enabled,
    }))
  )

  return NextResponse.json({ ok: true })
}
