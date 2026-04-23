'use client'

/**
 * AnnotationModal — draws arrows, boxes, circles, and text on inspection photos.
 * Uses Fabric.js v7. On save, exports the canvas as a JPEG and uploads to Cloudinary.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { X, ArrowUpRight, Square, Circle as CircleIcon, Type, Trash2, Undo2, Check, Loader2, Move } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'

type Tool = 'select' | 'arrow' | 'rect' | 'circle' | 'text'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#ffffff', '#000000']

interface Props {
  photoUrl: string
  inspectionId: string
  itemId: string
  onSave: (newUrl: string) => void
  onClose: () => void
}

export default function AnnotationModal({ photoUrl, inspectionId, itemId, onSave, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Store fabric canvas instance in a ref — avoid storing in state (not serialisable)
  const fabricRef = useRef<import('fabric').Canvas | null>(null)
  const [tool, setTool] = useState<Tool>('arrow')
  const [color, setColor] = useState('#ef4444')
  const [saving, setSaving] = useState(false)
  const [fabricReady, setFabricReady] = useState(false)

  // Track mouse-draw state outside React to avoid stale closures
  const drawingRef = useRef<{
    active: boolean
    startX: number
    startY: number
    shape: import('fabric').FabricObject | null
  }>({ active: false, startX: 0, startY: 0, shape: null })

  // ── Initialize Fabric canvas once ──
  useEffect(() => {
    let destroyed = false

    async function init() {
      const fabric = await import('fabric')
      if (destroyed || !canvasRef.current) return

      const container = canvasRef.current.parentElement!
      const W = Math.min(container.clientWidth - 32, 900)
      const H = Math.min(window.innerHeight - 220, 600)

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: W,
        height: H,
        selection: false,
      })
      fabricRef.current = canvas

      // Load the photo as background
      try {
        const img = await fabric.FabricImage.fromURL(photoUrl, { crossOrigin: 'anonymous' })
        const scale = Math.min(W / img.width!, H / img.height!)
        canvas.backgroundImage = img
        img.set({ scaleX: scale, scaleY: scale, left: (W - img.width! * scale) / 2, top: (H - img.height! * scale) / 2 })
        canvas.renderAll()
      } catch {
        // If crossOrigin fails, load without it (Cloudinary URLs support CORS)
        try {
          const img = await fabric.FabricImage.fromURL(photoUrl)
          const scale = Math.min(W / img.width!, H / img.height!)
          canvas.backgroundImage = img
          img.set({ scaleX: scale, scaleY: scale, left: (W - img.width! * scale) / 2, top: (H - img.height! * scale) / 2 })
          canvas.renderAll()
        } catch {
          toast.error('Could not load photo for annotation')
        }
      }

      setFabricReady(true)
    }

    init()

    return () => {
      destroyed = true
      fabricRef.current?.dispose()
      fabricRef.current = null
    }
  }, [photoUrl])

  // ── Wire up mouse events when tool or color changes ──
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !fabricReady) return

    // Toggle selection mode
    canvas.selection = tool === 'select'
    canvas.getObjects().forEach((o) => (o.selectable = tool === 'select'))

    async function onMouseDown(e: import('fabric').TPointerEventInfo) {
      const fabric = await import('fabric')
      const canvas = fabricRef.current
      if (!canvas) return
      const pointer = canvas.getViewportPoint(e.e)
      drawingRef.current.active = true
      drawingRef.current.startX = pointer.x
      drawingRef.current.startY = pointer.y
      drawingRef.current.shape = null

      if (tool === 'text') {
        const text = new fabric.IText('Text', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 22,
          fill: color,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          editable: true,
          selectable: true,
        })
        canvas.add(text)
        canvas.setActiveObject(text)
        text.enterEditing()
        drawingRef.current.active = false
      }
    }

    async function onMouseMove(e: import('fabric').TPointerEventInfo) {
      const fabric = await import('fabric')
      const canvas = fabricRef.current
      if (!canvas || !drawingRef.current.active) return
      const pointer = canvas.getViewportPoint(e.e)
      const { startX, startY } = drawingRef.current

      if (tool === 'rect') {
        if (drawingRef.current.shape) canvas.remove(drawingRef.current.shape)
        const rect = new fabric.Rect({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          width: Math.abs(pointer.x - startX),
          height: Math.abs(pointer.y - startY),
          stroke: color,
          strokeWidth: 3,
          fill: 'transparent',
          selectable: false,
          evented: false,
        })
        canvas.add(rect)
        drawingRef.current.shape = rect
        canvas.renderAll()
      }

      if (tool === 'circle') {
        if (drawingRef.current.shape) canvas.remove(drawingRef.current.shape)
        const r = Math.sqrt(Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)) / 2
        const circle = new fabric.Circle({
          left: (startX + pointer.x) / 2 - r,
          top: (startY + pointer.y) / 2 - r,
          radius: r,
          stroke: color,
          strokeWidth: 3,
          fill: 'transparent',
          selectable: false,
          evented: false,
        })
        canvas.add(circle)
        drawingRef.current.shape = circle
        canvas.renderAll()
      }

      if (tool === 'arrow') {
        if (drawingRef.current.shape) canvas.remove(drawingRef.current.shape)
        // Arrow = Line + arrowhead Triangle grouped together
        const dx = pointer.x - startX
        const dy = pointer.y - startY
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)

        const line = new fabric.Line([startX, startY, pointer.x, pointer.y], {
          stroke: color, strokeWidth: 3, selectable: false, evented: false,
        })
        const head = new fabric.Triangle({
          width: 16, height: 20,
          fill: color,
          left: pointer.x,
          top: pointer.y,
          angle: angle + 90,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        })
        const group = new fabric.Group([line, head], { selectable: false, evented: false })
        canvas.add(group)
        drawingRef.current.shape = group
        canvas.renderAll()
      }
    }

    function onMouseUp() {
      drawingRef.current.active = false
      // Make the final shape selectable now
      if (drawingRef.current.shape && tool !== 'text') {
        drawingRef.current.shape.set({ selectable: true, evented: true })
        fabricRef.current?.renderAll()
      }
      drawingRef.current.shape = null
    }

    canvas.on('mouse:down', onMouseDown)
    canvas.on('mouse:move', onMouseMove)
    canvas.on('mouse:up', onMouseUp)

    return () => {
      canvas.off('mouse:down', onMouseDown)
      canvas.off('mouse:move', onMouseMove)
      canvas.off('mouse:up', onMouseUp)
    }
  }, [tool, color, fabricReady])

  function undo() {
    const canvas = fabricRef.current
    if (!canvas) return
    const objects = canvas.getObjects()
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1])
      canvas.renderAll()
    }
  }

  function clearAll() {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.getObjects().forEach((o) => canvas.remove(o))
    canvas.renderAll()
  }

  const handleSave = useCallback(async () => {
    const canvas = fabricRef.current
    if (!canvas) return
    setSaving(true)

    try {
      // Deselect everything so selection borders don't appear in export
      canvas.discardActiveObject()
      canvas.renderAll()

      // Export canvas as JPEG data URL
      const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.9, multiplier: 1 })

      // Convert data URL → Blob → File
      const blob = await fetch(dataUrl).then((r) => r.blob())
      const file = new File([blob], 'annotated.jpg', { type: 'image/jpeg' })

      // Compress before upload
      const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1600, useWebWorker: true })

      // Get signed Cloudinary params
      const sigRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionId, itemId }),
      })
      const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json()

      const formData = new FormData()
      formData.append('file', compressed)
      formData.append('signature', signature)
      formData.append('timestamp', String(timestamp))
      formData.append('folder', folder)
      formData.append('api_key', apiKey)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadRes.json()

      if (uploadData.secure_url) {
        onSave(uploadData.secure_url)
        toast.success('Annotated photo saved!')
      } else {
        toast.error('Upload failed')
      }
    } catch {
      toast.error('Failed to save annotation')
    } finally {
      setSaving(false)
    }
  }, [inspectionId, itemId, onSave])

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">Annotate Photo</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex-wrap">
          {/* Tools */}
          {([
            { id: 'select', icon: Move, label: 'Select' },
            { id: 'arrow', icon: ArrowUpRight, label: 'Arrow' },
            { id: 'rect', icon: Square, label: 'Box' },
            { id: 'circle', icon: CircleIcon, label: 'Circle' },
            { id: 'text', icon: Type, label: 'Text' },
          ] as { id: Tool; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              title={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tool === id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Colors */}
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full border-2 transition-transform ${color === c ? 'border-blue-500 scale-125' : 'border-slate-300'}`}
              style={{ backgroundColor: c }}
            />
          ))}

          <div className="h-5 w-px bg-slate-200 mx-1" />

          <button onClick={undo} title="Undo" className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={clearAll} title="Clear all" className="p-1.5 text-slate-500 hover:text-red-500 rounded-lg hover:bg-slate-100">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-slate-900 p-4 min-h-64">
          <canvas ref={canvasRef} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Check className="h-4 w-4 mr-2" />Save Annotation</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
