import { db, connectedAccounts } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { encrypt, decrypt, isEncrypted } from '@/lib/crypto'

interface GoogleTokens {
  accessToken: string
  refreshToken: string | null
  email: string | null
}

// Get a valid Google access token for a user, refreshing if expired
export async function getGoogleTokens(userId: string): Promise<GoogleTokens | null> {
  const [account] = await db.select().from(connectedAccounts)
    .where(and(eq(connectedAccounts.userId, userId), eq(connectedAccounts.provider, 'google')))
    .limit(1)

  if (!account) return null

  const accessToken = isEncrypted(account.accessToken) ? decrypt(account.accessToken) : account.accessToken
  const refreshToken = account.refreshToken
    ? (isEncrypted(account.refreshToken) ? decrypt(account.refreshToken) : account.refreshToken)
    : null

  // Check if token is still valid (with 5-minute buffer)
  const now = new Date()
  const expiresAt = account.expiresAt ? new Date(account.expiresAt) : null
  const isExpired = !expiresAt || (expiresAt.getTime() - 5 * 60 * 1000) < now.getTime()

  if (!isExpired) {
    return { accessToken, refreshToken, email: account.email }
  }

  // Token expired — attempt refresh
  if (!refreshToken) {
    console.warn(`[InspectIQ] Google token expired for user ${userId} but no refresh token available`)
    return null
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    console.error('[InspectIQ] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured')
    return null
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error(`[InspectIQ] Google token refresh failed for user ${userId}:`, err)
      // If refresh token is revoked, delete the connection
      if (tokenRes.status === 400 || tokenRes.status === 401) {
        await db.delete(connectedAccounts).where(eq(connectedAccounts.id, account.id))
        console.warn(`[InspectIQ] Google connection removed for user ${userId} — refresh token revoked`)
      }
      return null
    }

    const tokens = await tokenRes.json()
    const newAccessToken = tokens.access_token
    const newExpiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000)

    // Update stored tokens
    await db.update(connectedAccounts).set({
      accessToken: encrypt(newAccessToken),
      expiresAt: newExpiresAt,
      updatedAt: new Date(),
    }).where(eq(connectedAccounts.id, account.id))

    console.log(`[InspectIQ] Google token refreshed for user ${userId}`)

    return { accessToken: newAccessToken, refreshToken, email: account.email }
  } catch (err) {
    console.error(`[InspectIQ] Google token refresh error for user ${userId}:`, err)
    return null
  }
}

// Check if a user has a valid (or refreshable) Google connection
export async function hasValidGoogleConnection(userId: string): Promise<boolean> {
  const tokens = await getGoogleTokens(userId)
  return tokens !== null
}
