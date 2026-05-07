export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getProfile, isOwnerEmail } from '@/lib/auth'
import DashboardNav from '@/components/layout/DashboardNav'
import OfflineBanner from '@/components/layout/OfflineBanner'
import OnboardingModal from '@/components/layout/OnboardingModal'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreditCard, Lock, TrendingUp, Star } from 'lucide-react'
import { headers } from 'next/headers'
import { db, inspections, profiles } from '@/lib/db'
import { eq, count } from 'drizzle-orm'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/auth/login')

  const profile = await getProfile()
  const isAdmin = !!profile && profile.email === ADMIN_EMAIL
  const isOwner = !!profile && isOwnerEmail(profile.email)
  const trialStillValid = profile?.subscriptionStatus === 'trialing' && profile?.trialEndsAt && new Date(profile.trialEndsAt) > new Date()
  const isActive = isOwner || profile?.subscriptionStatus === 'active' || trialStillValid
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const isSettingsPage = pathname.includes('/settings')

  let inspectionCount = 0
  let foundingRemaining = 50
  if (!isActive && !isSettingsPage && profile?.id) {
    const [countRow, spotsRow] = await Promise.all([
      db.select({ total: count() }).from(inspections).where(eq(inspections.userId, profile.id)),
      db.select({ total: count() }).from(profiles).where(eq(profiles.isFoundingMember, true)),
    ])
    inspectionCount = countRow[0]?.total ?? 0
    foundingRemaining = Math.max(0, 50 - (spotsRow[0]?.total ?? 0))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <OfflineBanner />
      <OnboardingModal />
      <DashboardNav profile={profile} isAdmin={isAdmin} />
      {/* ml-0 on mobile (bottom nav), ml-64 on desktop (sidebar) */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pt-18 md:pt-8 pb-20 md:pb-8">
        {isActive || isSettingsPage ? children : <SubscriptionGate inspectionCount={inspectionCount} foundingRemaining={foundingRemaining} />}
      </main>
    </div>
  )
}

function SubscriptionGate({ inspectionCount, foundingRemaining }: { inspectionCount: number; foundingRemaining: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 mb-6">
        <Lock className="h-7 w-7 text-amber-500" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">Your trial has ended</h2>
      <p className="text-slate-500 max-w-sm mb-6">
        {inspectionCount > 0
          ? `Your ${inspectionCount} inspection${inspectionCount > 1 ? 's' : ''}, reports, and photos are saved — subscribe to pick up right where you left off.`
          : 'Your work is saved and waiting. Subscribe to pick up right where you left off.'}
      </p>

      {/* ROI callout */}
      <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-sm font-medium px-4 py-2.5 rounded-xl mb-6">
        <TrendingUp className="h-4 w-4 shrink-0" />
        Most inspectors make $99 back on their very first report
      </div>

      {/* Founding member urgency */}
      {foundingRemaining > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-sm px-4 py-2.5 rounded-xl mb-6">
          <Star className="h-4 w-4 shrink-0" />
          <span>Only <strong>{foundingRemaining} founding member spots</strong> left — lock in $99/mo forever</span>
        </div>
      )}

      <Link href="/dashboard/settings">
        <Button className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200 px-8 text-base">
          <CreditCard className="h-4 w-4 mr-2" />
          Subscribe — $99/month
        </Button>
      </Link>
      <p className="text-xs text-slate-400 mt-3">Cancel anytime · Annual plan available ($79/mo)</p>
      <Link href="/sample-report" target="_blank" className="text-xs text-blue-500 hover:underline mt-4 block">
        View a sample report →
      </Link>
    </div>
  )
}
