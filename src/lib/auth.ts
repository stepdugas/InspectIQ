import { auth, currentUser } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { sendWelcomeEmail, sendReferralNotification } from '@/lib/email'

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Get current user's profile, creating it if it doesn't exist yet
export async function getProfile() {
  const { userId } = await auth()
  if (!userId) return null

  const existing = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)
  if (existing[0]) return existing[0]

  // First login — create profile from Clerk user data
  const user = await currentUser()
  if (!user) return null

  const email = user.emailAddresses[0]?.emailAddress ?? ''
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || null
  const firstName = user.firstName ?? ''

  // Check for referral code cookie
  const cookieStore = await cookies()
  const refCode = cookieStore.get('referral_code')?.value ?? null
  let referredBy: string | null = null
  let trialDays = 14

  if (refCode) {
    const [referrer] = await db.select().from(profiles).where(eq(profiles.referralCode, refCode)).limit(1)
    if (referrer) {
      referredBy = referrer.id
      trialDays = 30 // referred users get 30-day trial
      // Notify referrer
      sendReferralNotification(referrer.email, referrer.fullName ?? '', email).catch((err) => console.error('[InspectIQ] Email send failed:', err))
    }
  }

  const referralCode = generateReferralCode()

  const [created] = await db.insert(profiles).values({
    id: userId,
    email,
    fullName,
    referralCode,
    referredBy,
    subscriptionStatus: 'trialing',
    trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
  }).returning()

  // Send welcome email (non-blocking)
  sendWelcomeEmail(email, firstName).catch((err) => console.error('[InspectIQ] Email send failed:', err))

  return created
}

export async function getUserId() {
  const { userId } = await auth()
  return userId
}

// Comma-separated list of emails that bypass the paywall (owner/founders)
const OWNER_EMAILS = (process.env.OWNER_EMAILS ?? process.env.ADMIN_EMAIL ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)

export function isOwnerEmail(email: string): boolean {
  return OWNER_EMAILS.includes(email.toLowerCase())
}

// Returns true if the user has an active subscription or valid trial
export async function hasActiveAccess(): Promise<boolean> {
  const profile = await getProfile()
  if (!profile) return false

  // Owner/founder bypass — always has access
  if (isOwnerEmail(profile.email)) return true

  if (profile.subscriptionStatus === 'active') return true

  if (profile.subscriptionStatus === 'trialing' && profile.trialEndsAt) {
    return new Date(profile.trialEndsAt) > new Date()
  }

  return false
}
