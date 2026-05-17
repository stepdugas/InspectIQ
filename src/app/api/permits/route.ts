import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getPermitBrief } from '@/lib/permits'

// GET /api/permits?address=123+Main+St+Austin+TX
export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address || address.trim().length < 5) {
    return NextResponse.json({ error: 'Address is required (min 5 characters)' }, { status: 400 })
  }

  const brief = await getPermitBrief(address)

  return NextResponse.json(brief)
}
