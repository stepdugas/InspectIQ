'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteInspectionButton({ inspectionId, address }: { inspectionId: string; address: string }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirming) {
      setConfirming(true)
      // Auto-reset after 3 seconds if they don't confirm
      setTimeout(() => setConfirming(false), 3000)
      return
    }

    setDeleting(true)
    const res = await fetch(`/api/inspections/${inspectionId}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success(`Deleted: ${address}`)
      router.refresh()
    } else {
      toast.error('Failed to delete inspection')
    }
    setDeleting(false)
    setConfirming(false)
  }

  if (deleting) {
    return <Loader2 className="h-4 w-4 animate-spin text-slate-400" onClick={(e) => e.preventDefault()} />
  }

  return (
    <button
      onClick={handleDelete}
      className={`p-1.5 rounded-md transition-colors ${
        confirming
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
      }`}
      title={confirming ? 'Click again to confirm delete' : 'Delete inspection'}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
