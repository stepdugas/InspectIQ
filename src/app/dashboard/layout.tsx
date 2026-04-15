export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth'
import DashboardNav from '@/components/layout/DashboardNav'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreditCard, Lock } from 'lucide-react'
import { headers } from 'next/headers'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/auth/login')

  const profile = await getProfile()
  const isAdmin = !!profile && profile.email === ADMIN_EMAIL
  const trialStillValid = profile?.subscriptionStatus === 'trialing' && profile?.trialEndsAt && new Date(profile.trialEndsAt) > new Date()
  const isActive = profile?.subscriptionStatus === 'active' || trialStillValid
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const isSettingsPage = pathname.includes('/settings')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardNav profile={profile} isAdmin={isAdmin} />
      {/* ml-0 on mobile (bottom nav), ml-64 on desktop (sidebar) */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pt-18 md:pt-8 pb-20 md:pb-8">
        {isActive || isSettingsPage ? children : <SubscriptionGate />}
      </main>
    </div>
  )
}

function SubscriptionGate() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 mb-6">
        <Lock className="h-7 w-7 text-amber-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Your trial has ended</h2>
      <p className="text-slate-500 max-w-sm mb-2">
        Your work is saved and waiting. Subscribe to pick up right where you left off.
      </p>
      <p className="text-slate-400 text-sm mb-8">
        All your inspections, reports, and photos are safe.
      </p>
      <Link href="/dashboard/settings">
        <Button className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200 px-8">
          <CreditCard className="h-4 w-4 mr-2" />
          Subscribe — $99/month
        </Button>
      </Link>
      <p className="text-xs text-slate-400 mt-3">Cancel anytime</p>
    </div>
  )
}
