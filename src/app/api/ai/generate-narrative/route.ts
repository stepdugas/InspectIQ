import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { hasActiveAccess } from '@/lib/auth'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Simple in-memory rate limiter: max 30 requests per minute per user
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 30
const rateLimitMap = new Map<string, number[]>()

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(userId) ?? []
  // Drop timestamps outside the current window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(userId, recent)
    return true
  }
  recent.push(now)
  rateLimitMap.set(userId, recent)
  return false
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (isRateLimited(userId)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute before generating more narratives.' },
      { status: 429 },
    )
  }

  // Prevent expired trial / inactive users from burning AI credits
  const canAccess = await hasActiveAccess()
  if (!canAccess) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { roomName, items } = await request.json()
  if (!roomName || !items?.length) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

  const inspectedItems = items
    .filter((item: { condition: string }) => item.condition && item.condition !== 'na' && item.condition !== 'not_inspected')

  if (inspectedItems.length === 0) {
    return NextResponse.json({ narrative: 'No items were inspected in this section.' })
  }

  const itemsText = inspectedItems
    .map((item: { name: string; condition: string; notes: string }) =>
      `- ${item.name}: ${item.condition.toUpperCase()}${item.notes ? ` — Notes: ${item.notes}` : ''}`
    ).join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are a professional home inspector writing a formal inspection report. Write a concise, professional narrative paragraph for the following room section. Use clear, objective language appropriate for a legal inspection document. Write in paragraph form only — no bullet points. Do not repeat the room name as a heading.

IMPORTANT: Only write about the items listed below. Do NOT invent, assume, or mention any items, conditions, or findings that are not explicitly provided. If an item has no notes, just mention its condition briefly.

Room: ${roomName}

Findings:
${itemsText}

Write the narrative now:`,
    }],
  })

  const narrative = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ narrative })
}
