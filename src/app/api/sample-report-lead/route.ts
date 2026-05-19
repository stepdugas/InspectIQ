import { NextResponse } from 'next/server'

// Simple lead capture — logs to console for now, can be upgraded to DB/CRM later
export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    console.log(`[InspectIQ] Sample report lead captured: ${email}`)

    // TODO: store in a leads table or send to CRM when volume justifies it

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
