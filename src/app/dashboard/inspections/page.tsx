export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getUserId } from '@/lib/auth'
import { db, inspections } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, Plus } from 'lucide-react'
import InspectionsList from '@/components/inspection/InspectionsList'

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
        <InspectionsList inspections={allInspections} />
      )}
    </div>
  )
}
