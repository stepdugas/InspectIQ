import { timingSafeEqual } from 'node:crypto'
import { db, agentConfigs, agentActivityLog, connectedAccounts } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import type { AgentType } from '@/lib/agents'

// Validate cron request authorization — returns error response or null if valid
export function validateCronAuth(request: Request): Response | null {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[InspectIQ] CRON_SECRET not configured')
    return Response.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${cronSecret}`
  if (authHeader.length !== expected.length || !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// Get an agent's config for a specific user, returns null if agent is disabled
export async function getAgentConfig(userId: string, agentType: AgentType): Promise<Record<string, unknown> | null> {
  const [config] = await db.select().from(agentConfigs)
    .where(and(eq(agentConfigs.userId, userId), eq(agentConfigs.agentType, agentType)))
    .limit(1)

  if (!config || !config.enabled) return null
  return (config.config ?? {}) as Record<string, unknown>
}

// Log an agent action for the activity feed
export async function logAgentActivity(
  userId: string,
  agentType: AgentType,
  action: string,
  details: Record<string, unknown> = {},
  inspectionId?: string,
) {
  await db.insert(agentActivityLog).values({
    userId,
    agentType,
    action,
    details,
    inspectionId: inspectionId ?? null,
  })
}

// Check if a user has a specific provider connected
export async function hasConnector(userId: string, provider: string): Promise<boolean> {
  const [account] = await db.select({ id: connectedAccounts.id }).from(connectedAccounts)
    .where(and(eq(connectedAccounts.userId, userId), eq(connectedAccounts.provider, provider)))
    .limit(1)
  return !!account
}
