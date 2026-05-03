export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { db, profiles, inspections } from '@/lib/db'
import { count, eq, desc } from 'drizzle-orm'
import { reports, inspections as inspectionsTable } from '@/lib/db'
import Link from 'next/link'
import { Building2, ShieldCheck } from 'lucide-react'
import AdminDashboard from '@/components/admin/AdminDashboard'
import SeedButton from '@/components/admin/SeedButton'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')

  const adminEmail = process.env.ADMIN_EMAIL ?? ''
  const [allProfiles, inspectionCountResult, adminProfile] = await Promise.all([
    db.select().from(profiles).orderBy(profiles.createdAt),
    db.select({ count: count() }).from(inspections),
    db.select().from(profiles).where(eq(profiles.email, adminEmail)).limit(1),
  ])

  const inspectionCount = inspectionCountResult[0]?.count ?? 0

  // Fetch demo inspections (admin's inspections with their share tokens)
  const demoInspections = adminProfile[0] ? await db
    .select({
      id: inspections.id,
      propertyAddress: inspections.propertyAddress,
      clientName: inspections.clientName,
      inspectionDate: inspections.inspectionDate,
      status: inspections.status,
      shareToken: reports.shareToken,
    })
    .from(inspections)
    .leftJoin(reports, eq(reports.inspectionId, inspections.id))
    .where(eq(inspections.userId, adminProfile[0].id))
    .orderBy(desc(inspections.createdAt))
    : []

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              <span className="font-bold text-white">InspectIQ</span>
              <span className="text-slate-500 text-sm">/ Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SeedButton />
            <Link
              href="/"
              className="px-3 py-1.5 text-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors bg-transparent"
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </div>

      <AdminDashboard
        profiles={allProfiles}
        inspectionCount={Number(inspectionCount)}
        reportCount={0}
        demoInspections={demoInspections}
      />
    </div>
  )
}
