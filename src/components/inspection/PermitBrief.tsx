'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Loader2, ChevronDown, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'

interface Permit {
  id: string
  type: string | null
  description: string | null
  status: string | null
  fileDate: string | null
  issueDate: string | null
  finalDate: string | null
  jobValue: number | null
  contractor: string | null
  jurisdiction: string | null
}

interface PermitBriefData {
  address: string
  permits: Permit[]
  source: string
  fetchedAt: string
  cached: boolean
}

export default function PermitBrief({ address }: { address: string }) {
  const [data, setData] = useState<PermitBriefData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [fetched, setFetched] = useState(false)

  async function fetchPermits() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/permits?address=${encodeURIComponent(address)}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Failed to fetch permits (${res.status})`)
      }
      const result = await res.json()
      setData(result)
      setFetched(true)
      if (result.permits.length > 0) setExpanded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permit history')
    } finally {
      setLoading(false)
    }
  }

  // Don't auto-fetch — let the inspector choose when to pull permits
  if (!fetched && !loading) {
    return (
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-900">Pre-Inspection Brief</span>
              <span className="text-xs text-slate-400">Permit history for this property</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchPermits}
              disabled={loading}
              className="text-xs"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
              Pull Permits
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Pulling permit history...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-100 shadow-sm">
        <CardContent className="py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={fetchPermits} className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const permits = data.permits

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="py-0 px-0">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-900">Pre-Inspection Brief</span>
            {permits.length > 0 ? (
              <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-xs">
                {permits.length} permit{permits.length !== 1 ? 's' : ''}
              </Badge>
            ) : (
              <Badge className="bg-slate-50 text-slate-400 border-slate-100 text-xs">
                No permits found
              </Badge>
            )}
            {data.cached && (
              <span className="text-[10px] text-slate-400">cached</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); fetchPermits() }}
              className="text-xs h-7 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            {expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          </div>
        </button>

        {/* Permit list */}
        {expanded && permits.length > 0 && (
          <div className="border-t border-slate-100 divide-y divide-slate-50">
            {permits.map((permit, i) => (
              <div key={permit.id || i} className="px-6 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {permit.type && (
                        <Badge className="bg-slate-100 text-slate-700 border-slate-100 text-xs">
                          {permit.type}
                        </Badge>
                      )}
                      {permit.status && (
                        <Badge className={
                          permit.status.toLowerCase().includes('final') ? 'bg-green-50 text-green-600 border-green-100 text-xs' :
                          permit.status.toLowerCase().includes('open') || permit.status.toLowerCase().includes('issued') ? 'bg-amber-50 text-amber-600 border-amber-100 text-xs' :
                          'bg-slate-50 text-slate-500 border-slate-100 text-xs'
                        }>
                          {permit.status}
                        </Badge>
                      )}
                    </div>
                    {permit.description && (
                      <p className="text-sm text-slate-600 mt-1">{permit.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {permit.fileDate && (
                        <span className="text-xs text-slate-400">Filed: {permit.fileDate}</span>
                      )}
                      {permit.issueDate && (
                        <span className="text-xs text-slate-400">Issued: {permit.issueDate}</span>
                      )}
                      {permit.finalDate && (
                        <span className="text-xs text-slate-400">Final: {permit.finalDate}</span>
                      )}
                      {permit.contractor && (
                        <span className="text-xs text-slate-400">Contractor: {permit.contractor}</span>
                      )}
                    </div>
                  </div>
                  {permit.jobValue != null && permit.jobValue > 0 && (
                    <span className="text-sm font-medium text-slate-700 shrink-0">
                      ${permit.jobValue.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {expanded && permits.length === 0 && (
          <div className="border-t border-slate-100 px-6 py-6 text-center">
            <p className="text-sm text-slate-400">No building permits found for this address.</p>
            <p className="text-xs text-slate-400 mt-1">This may mean the property has no recorded permits, or the jurisdiction isn't covered yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
