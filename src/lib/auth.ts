import { auth, currentUser } from '@clerk/nextjs/server'
import { db, profiles } from '@/lib/db'
import { eq } from 'drizzle-orm'

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

  const [created] = await db.insert(profiles).values({
    id: userId,
    email,
    fullName,
    subscriptionStatus: 'trialing',
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  }).returning()

  return created
}

export async function getUserId() {
  const { userId } = await auth()
  return userId
}
