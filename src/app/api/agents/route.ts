import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, agentConfigs } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { AGENT_DEFINITIONS, AGENT_TYPES, type AgentType } from '@/lib/agents'
import { logAgentActivity, hasConnector } from '@/lib/agent-runner'

// GET /api/agents — returns all 13 agent configs for this user (creates defaults if missing)
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await db.select().from(agentConfigs).where(eq(agentConfigs.userId, userId))

  const existingTypes = new Set(existing.map(a => a.agentType))

  // Create default configs for any agents that don't exist yet
  const missing = AGENT_DEFINITIONS.filter(d => !existingTypes.has(d.type))
  if (missing.length > 0) {
    await db.insert(agentConfigs).values(
      missing.map(d => ({
        userId,
        agentType: d.type,
        enabled: d.defaultEnabled,
        config: d.defaultConfig,
      }))
    )
  }

  // Re-fetch all configs
  const allConfigs = await db.select().from(agentConfigs).where(eq(agentConfigs.userId, userId))

  // Merge with definitions for the frontend
  const agents = AGENT_DEFINITIONS.map(def => {
    const config = allConfigs.find(c => c.agentType === def.type)
    return {
      ...def,
      id: config?.id,
      enabled: config?.enabled ?? def.defaultEnabled,
      config: config?.config ?? def.defaultConfig,
      updatedAt: config?.updatedAt,
    }
  })

  return NextResponse.json({ agents })
}

// PATCH /api/agents — update a specific agent's config
export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { agentType, enabled, config } = body

  if (!agentType || !AGENT_TYPES.includes(agentType as AgentType)) {
    return NextResponse.json({ error: 'Invalid agent type' }, { status: 400 })
  }

  // Block enabling agents that require connectors the user hasn't connected
  if (enabled === true) {
    const def = AGENT_DEFINITIONS.find(d => d.type === agentType)
    if (def && def.requiresConnector.length > 0) {
      const connected = await Promise.all(def.requiresConnector.map(p => hasConnector(userId, p)))
      if (!connected.some(Boolean)) {
        return NextResponse.json({
          error: `Connect ${def.requiresConnector.join(' or ')} first to enable ${def.name}`,
        }, { status: 400 })
      }
    }
  }

  const [existing] = await db.select().from(agentConfigs)
    .where(and(eq(agentConfigs.userId, userId), eq(agentConfigs.agentType, agentType)))
    .limit(1)

  if (existing) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (enabled !== undefined) updateData.enabled = enabled
    if (config !== undefined) updateData.config = config
    await db.update(agentConfigs).set(updateData)
      .where(eq(agentConfigs.id, existing.id))
  } else {
    const def = AGENT_DEFINITIONS.find(d => d.type === agentType)
    await db.insert(agentConfigs).values({
      userId,
      agentType,
      enabled: enabled ?? def?.defaultEnabled ?? false,
      config: config ?? def?.defaultConfig ?? {},
    })
  }

  // Log the config change for audit trail
  await logAgentActivity(userId, agentType as AgentType, 'config_updated', {
    enabled: enabled ?? undefined,
    configChanged: config !== undefined,
  }).catch(() => {}) // Don't fail the request if logging fails

  return NextResponse.json({ ok: true })
}
