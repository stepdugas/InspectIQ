import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, connectedAccounts } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { encrypt } from '@/lib/crypto'

// GET /api/auth/connect/google/callback — handles OAuth callback
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const stateUserId = searchParams.get('state')
  const error = searchParams.get('error')

  const { APP_URL: appUrl } = await import('@/lib/config')

  if (error || !code || !stateUserId) {
    return NextResponse.redirect(`${appUrl}/dashboard/agents?connect=error&reason=${error ?? 'missing_code'}`)
  }

  // Validate that the OAuth state matches the currently logged-in user
  const { userId: currentUserId } = await auth()
  if (!currentUserId || currentUserId !== stateUserId) {
    console.error('[InspectIQ] OAuth state mismatch — possible CSRF attack')
    return NextResponse.redirect(`${appUrl}/dashboard/settings?connect=error&reason=state_mismatch`)
  }

  const userId = currentUserId

  const clientId = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri = `${appUrl}/api/auth/connect/google/callback`

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('[InspectIQ] Google token exchange failed:', err)
      return NextResponse.redirect(`${appUrl}/dashboard/settings?connect=error&reason=token_exchange`)
    }

    const tokens = await tokenRes.json()
    const { access_token, refresh_token, expires_in, scope } = tokens

    // Get user's email
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const userInfo = await userInfoRes.json()
    const email = userInfo.email ?? null

    // Encrypt tokens before storing
    const encryptedAccess = encrypt(access_token)
    const encryptedRefresh = refresh_token ? encrypt(refresh_token) : null
    const expiresAt = new Date(Date.now() + (expires_in ?? 3600) * 1000)

    // Upsert: delete existing Google connection, insert new one
    await db.delete(connectedAccounts).where(
      and(eq(connectedAccounts.userId, userId), eq(connectedAccounts.provider, 'google'))
    )

    await db.insert(connectedAccounts).values({
      userId,
      provider: 'google',
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      scopes: scope ?? '',
      expiresAt,
      email,
    })

    console.log(`[InspectIQ] Google account connected for user ${userId}: ${email}`)

    return NextResponse.redirect(`${appUrl}/dashboard/agents?connect=success&provider=google`)
  } catch (err) {
    console.error('[InspectIQ] Google OAuth callback error:', err)
    return NextResponse.redirect(`${appUrl}/dashboard/settings?connect=error&reason=server_error`)
  }
}
