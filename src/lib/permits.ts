import { createHash } from 'node:crypto'
import { db, permitCache } from '@/lib/db'
import { eq, gt } from 'drizzle-orm'

export interface Permit {
  id: string
  type: string | null
  description: string | null
  status: string | null
  fileDate: string | null
  issueDate: string | null
  finalDate: string | null
  jobValue: number | null
  contractor: string | null
  jurisdiction: string | null
}

export interface PermitBrief {
  address: string
  permits: Permit[]
  source: string
  fetchedAt: string
  cached: boolean
}

const CACHE_DAYS = 30

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase().replace(/\s+/g, ' ')
}

function hashAddress(address: string): string {
  return createHash('sha256').update(normalizeAddress(address)).digest('hex')
}

// Check cache first, then fetch from Shovels.ai if not cached
export async function getPermitBrief(address: string): Promise<PermitBrief> {
  const hash = hashAddress(address)
  const now = new Date()

  // Check cache
  const [cached] = await db.select().from(permitCache)
    .where(eq(permitCache.addressHash, hash))
    .limit(1)

  if (cached && new Date(cached.expiresAt) > now) {
    return {
      address: cached.addressRaw,
      permits: JSON.parse(cached.permits) as Permit[],
      source: cached.source ?? 'shovels',
      fetchedAt: cached.fetchedAt?.toISOString() ?? now.toISOString(),
      cached: true,
    }
  }

  // Fetch from Shovels.ai
  const apiKey = process.env.SHOVELS_API_KEY
  if (!apiKey) {
    console.warn('[InspectIQ] SHOVELS_API_KEY not set — returning empty permit brief')
    return { address, permits: [], source: 'none', fetchedAt: now.toISOString(), cached: false }
  }

  const permits = await fetchFromShovels(address, apiKey)

  // Cache the result (upsert by address hash)
  const expiresAt = new Date(now.getTime() + CACHE_DAYS * 24 * 60 * 60 * 1000)

  if (cached) {
    await db.update(permitCache).set({
      permits: JSON.stringify(permits),
      fetchedAt: now,
      expiresAt,
      source: 'shovels',
    }).where(eq(permitCache.id, cached.id))
  } else {
    await db.insert(permitCache).values({
      addressHash: hash,
      addressRaw: address,
      permits: JSON.stringify(permits),
      fetchedAt: now,
      expiresAt,
      source: 'shovels',
    })
  }

  return { address, permits, source: 'shovels', fetchedAt: now.toISOString(), cached: false }
}

async function fetchFromShovels(address: string, apiKey: string): Promise<Permit[]> {
  try {
    const url = new URL('https://api.shovels.ai/v2/permits/search')
    url.searchParams.set('address', address)

    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      console.error(`[InspectIQ] Shovels API error: ${response.status} ${response.statusText}`)
      return []
    }

    const data = await response.json()
    const results = data.results ?? data.permits ?? data.data ?? []

    if (!Array.isArray(results)) return []

    return results.map((p: Record<string, unknown>): Permit => ({
      id: String(p.id ?? p.permit_id ?? ''),
      type: (p.type ?? p.permit_type ?? null) as string | null,
      description: (p.description ?? p.work_description ?? null) as string | null,
      status: (p.status ?? null) as string | null,
      fileDate: (p.file_date ?? p.filed_date ?? null) as string | null,
      issueDate: (p.issue_date ?? p.issued_date ?? null) as string | null,
      finalDate: (p.final_date ?? p.finaled_date ?? null) as string | null,
      jobValue: p.job_value != null ? Number(p.job_value) : null,
      contractor: (p.contractor ?? p.contractor_name ?? null) as string | null,
      jurisdiction: (p.jurisdiction ?? null) as string | null,
    }))
  } catch (err) {
    console.error('[InspectIQ] Shovels API fetch failed:', err)
    return []
  }
}
