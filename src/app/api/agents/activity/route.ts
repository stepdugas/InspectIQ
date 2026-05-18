import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, agentActivityLog } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

// GET /api/agents/activity?limit=20 — returns recent agent activity
export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100)

  const activity = await db.select().from(agentActivityLog)
    .where(eq(agentActivityLog.userId, userId))
    .orderBy(desc(agentActivityLog.createdAt))
    .limit(limit)

  return NextResponse.json({ activity })
}
