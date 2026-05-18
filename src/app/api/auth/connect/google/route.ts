import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// GET /api/auth/connect/google — initiates Google OAuth flow
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
  }

  const { APP_URL } = await import('@/lib/config')
  const redirectUri = `${APP_URL}/api/auth/connect/google/callback`

  const scopes = [
    'https://www.googleapis.com/auth/calendar', // read/write calendar
    'https://www.googleapis.com/auth/gmail.send', // send email as user
    'https://www.googleapis.com/auth/business.manage', // Google Business Profile
    'https://www.googleapis.com/auth/userinfo.email', // get email address
  ].join(' ')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline', // get refresh token
    prompt: 'consent', // always show consent screen to get refresh token
    state: userId, // pass userId through OAuth flow
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}
