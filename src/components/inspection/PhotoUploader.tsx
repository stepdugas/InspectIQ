'use client'

import { useState, useCallback } from 'react'
import imageCompression from 'browser-image-compression'
import { Upload, X, Loader2, Image as ImageIcon, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PhotoUploaderProps {
  inspectionId: string
  itemId: string
  existingPhotos?: string[]
  onPhotosChange?: (urls: string[]) => void
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
}

export default function PhotoUploader({ inspectionId, itemId, existingPhotos = [], onPhotosChange }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    if (!imageFiles.length) return
    setUploading(true)

    // Get signed upload params from our API
    const sigRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspectionId, itemId }),
    })
    const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json()

    const uploadedUrls: string[] = []

    for (const file of imageFiles) {
      try {
        const compressed = await imageCompression(file, COMPRESSION_OPTIONS)
        const formData = new FormData()
        formData.append('file', compressed)
        formData.append('signature', signature)
        formData.append('timestamp', String(timestamp))
        formData.append('folder', folder)
        formData.append('api_key', apiKey)

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (data.secure_url) uploadedUrls.push(data.secure_url)
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    const updated = [...photos, ...uploadedUrls]
    setPhotos(updated)
    onPhotosChange?.(updated)
    setUploading(false)
    if (uploadedUrls.length) toast.success(`${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''} uploaded`)
  }, [inspectionId, itemId, photos, onPhotosChange])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    uploadFiles(Array.from(e.dataTransfer.files))
  }

  function removePhoto(url: string) {
    const updated = photos.filter((p) => p !== url)
    setPhotos(updated)
    onPhotosChange?.(updated)
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        {/* Upload from library / drag-drop */}
        <label
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadFiles(Array.from(e.target.files))} disabled={uploading} />
          {uploading
            ? <><Loader2 className="h-5 w-5 text-blue-500 animate-spin" /><span className="text-xs text-slate-500">Uploading...</span></>
            : <><Upload className="h-5 w-5 text-slate-300" /><span className="text-xs text-slate-400">Upload / Drop</span></>
          }
        </label>

        {/* Take photo — opens camera directly on iOS/Android */}
        <label className="flex flex-col items-center justify-center gap-2 px-5 py-4 border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files && uploadFiles(Array.from(e.target.files))} disabled={uploading} />
          <Camera className="h-5 w-5 text-slate-300" />
          <span className="text-xs text-slate-400">Camera</span>
        </label>
      </div>

      {photos.length > 0 && (
        <>
          <div className="flex items-center gap-1.5 mt-3 mb-2">
            <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-medium text-blue-600">{photos.length} photo{photos.length > 1 ? 's' : ''} attached</span>
          </div>
          {/* 2-col on mobile for bigger thumbs, 3-col on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {photos.map((url) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Inspection photo" className="w-full h-full object-cover" />
                {/* Always-visible delete button (no hover required — works on touch) */}
                <button
                  onClick={() => removePhoto(url)}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 touch-manipulation"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
