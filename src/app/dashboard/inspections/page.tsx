export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getUserId } from '@/lib/auth'
import { db, inspections } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, Plus, Calendar, User, Mail, Clock } from 'lucide-react'

export default async function InspectionsPage() {
  const userId = await getUserId()
  if (!userId) return null

  const allInspections = await db
    .select()
    .from(inspections)
    .where(eq(inspections.userId, userId))
    .orderBy(desc(inspections.createdAt))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inspections</h1>
          <p className="text-slate-500 text-sm mt-1">All your inspection jobs</p>
        </div>
        <Link href="/dashboard/inspections/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />New Inspection
          </Button>
        </Link>
      </div>

      {allInspections.length === 0 ? (
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="py-20 text-center">
            <ClipboardList className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No inspections yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first inspection to get started</p>
            <Link href="/dashboard/inspections/new">
              <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" />New Inspection</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {allInspections.map((inspection) => (
            <Link key={inspection.id} href={`/dashboard/inspections/${inspection.id}`}>
              <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4 px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{inspection.propertyAddress}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <User className="h-3 w-3" />{inspection.clientName}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="h-3 w-3" />{inspection.inspectionDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Report delivery status */}
                      {inspection.status === 'completed' && (
                        inspection.reportDeliveredAt ? (
                          <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-xs">
                            <Mail className="h-3 w-3 mr-1" />Sent
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-50 text-slate-400 border-slate-100 text-xs">
                            <Mail className="h-3 w-3 mr-1" />Not sent
                          </Badge>
                        )
                      )}
                      {/* Follow-up status */}
                      {inspection.followUpStatus === 'scheduled' && (
                        <Badge className="bg-purple-50 text-purple-600 border-purple-100 text-xs">
                          <Clock className="h-3 w-3 mr-1" />Follow-up pending
                        </Badge>
                      )}
                      {inspection.followUpStatus === 'sent' && (
                        <Badge className="bg-purple-50 text-purple-600 border-purple-100 text-xs">
                          <Clock className="h-3 w-3 mr-1" />Followed up
                        </Badge>
                      )}
                      {/* Inspection status */}
                      <Badge className={
                        inspection.status === 'completed' ? 'bg-green-100 text-green-700 border-green-100' :
                        inspection.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-100 text-slate-600 border-slate-100'
                      }>
                        {inspection.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
