export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getUserId } from '@/lib/auth'
import { db, inspections, reports } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, FileText, Plus, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const userId = await getUserId()
  if (!userId) return null

  const [allInspections, allReports] = await Promise.all([
    db.select().from(inspections).where(eq(inspections.userId, userId)).orderBy(desc(inspections.createdAt)).limit(5),
    db.select().from(reports).where(eq(reports.userId, userId)),
  ])

  const completedCount = allInspections.filter((i) => i.status === 'completed').length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of your inspection activity</p>
        </div>
        <Link href="/dashboard/inspections/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />New Inspection
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Inspections', value: allInspections.length, icon: ClipboardList },
          { label: 'Completed', value: completedCount, icon: TrendingUp },
          { label: 'Reports Generated', value: allReports.length, icon: FileText },
        ].map((s) => (
          <Card key={s.label} className="border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <s.icon className="h-4 w-4" />{s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900">Recent Inspections</CardTitle>
          <Link href="/dashboard/inspections">
            <Button variant="ghost" size="sm" className="text-blue-600">View all</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {allInspections.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No inspections yet</p>
              <Link href="/dashboard/inspections/new">
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" size="sm">
                  <Plus className="h-4 w-4 mr-2" />Start your first inspection
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {allInspections.map((inspection) => (
                <Link key={inspection.id} href={`/dashboard/inspections/${inspection.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{inspection.propertyAddress}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {inspection.clientName} · {inspection.inspectionDate}
                      </p>
                    </div>
                    <Badge className={
                      inspection.status === 'completed' ? 'bg-green-100 text-green-700 border-green-100' :
                      inspection.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-slate-100 text-slate-600'
                    }>
                      {inspection.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
