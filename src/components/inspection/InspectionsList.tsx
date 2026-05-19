'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Mail, Clock, Search } from 'lucide-react'
import DeleteInspectionButton from '@/components/inspection/DeleteInspectionButton'

interface Inspection {
  id: string
  propertyAddress: string
  clientName: string
  clientEmail: string | null
  inspectionDate: string
  status: string | null
  reportDeliveredAt: Date | null
  followUpStatus: string | null
}

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
]

export default function InspectionsList({ inspections }: { inspections: Inspection[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = inspections.filter((i) => {
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter
    const matchesSearch = search === '' ||
      i.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
      i.clientName.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by address or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === tab.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-8">No inspections match your search</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((inspection) => (
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
                      <div className="hidden sm:flex items-center gap-2">
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
                        {inspection.followUpStatus === 'sent' && (
                          <Badge className="bg-purple-50 text-purple-600 border-purple-100 text-xs">
                            <Clock className="h-3 w-3 mr-1" />Followed up
                          </Badge>
                        )}
                      </div>
                      <Badge className={
                        inspection.status === 'completed' ? 'bg-green-100 text-green-700 border-green-100' :
                        inspection.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-100 text-slate-600 border-slate-100'
                      }>
                        {inspection.status?.replace('_', ' ')}
                      </Badge>
                      <DeleteInspectionButton inspectionId={inspection.id} address={inspection.propertyAddress} />
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
