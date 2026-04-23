'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, Pencil, LayoutTemplate, X, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { DEFAULT_ROOMS } from '@/lib/inspection-templates'

interface TemplateItem {
  id?: string
  name: string
}

interface TemplateRoom {
  id?: string
  _id: string  // stable client-side ID for drag-and-drop — always set before use
  name: string
  items: TemplateItem[]
}

interface CustomTemplate {
  id: string
  name: string
  description: string | null
  createdAt: string
  rooms: (TemplateRoom & { id: string })[]
}

const INSPECTION_TYPE_PRESETS: Record<string, Omit<TemplateRoom, '_id'>[]> = {
  'Commercial Building': [
    { name: 'Building Exterior', items: [{ name: 'Facade & cladding' }, { name: 'Parking lot & drainage' }, { name: 'Loading docks' }, { name: 'Signage & lighting' }] },
    { name: 'Roof System', items: [{ name: 'Membrane condition' }, { name: 'Drainage & scuppers' }, { name: 'HVAC curbs & penetrations' }, { name: 'Parapets & coping' }] },
    { name: 'Structural', items: [{ name: 'Columns & beams' }, { name: 'Floor systems' }, { name: 'Foundation visible elements' }] },
    { name: 'Electrical', items: [{ name: 'Main service & switchgear' }, { name: 'Panel labeling' }, { name: 'Emergency lighting' }, { name: 'Exit signs' }] },
    { name: 'Plumbing', items: [{ name: 'Restroom fixtures' }, { name: 'Backflow preventers' }, { name: 'Water heater(s)' }] },
    { name: 'HVAC', items: [{ name: 'Rooftop units' }, { name: 'Split systems' }, { name: 'Ductwork & diffusers' }, { name: 'Thermostats & controls' }] },
    { name: 'Fire & Life Safety', items: [{ name: 'Sprinkler system visible condition' }, { name: 'Fire extinguisher locations' }, { name: 'Egress paths & doors' }, { name: 'Alarm panel' }] },
  ],
  'Pool & Spa': [
    { name: 'Pool Structure', items: [{ name: 'Shell & finish condition' }, { name: 'Coping & tile' }, { name: 'Steps & handrails' }] },
    { name: 'Pool Equipment', items: [{ name: 'Pump & motor operation' }, { name: 'Filter type & condition' }, { name: 'Heater operation' }, { name: 'Automation system' }] },
    { name: 'Safety Features', items: [{ name: 'Fencing & gates (self-closing)' }, { name: 'Drain cover (VGB compliant)' }, { name: 'Safety signage' }] },
    { name: 'Deck & Surround', items: [{ name: 'Deck surface condition' }, { name: 'Drainage slope away from pool' }, { name: 'Electrical outlets (GFCI)' }] },
    { name: 'Spa / Hot Tub', items: [{ name: 'Jet operation' }, { name: 'Cover condition' }, { name: 'Blower operation' }, { name: 'Controls & thermostat' }] },
  ],
  'Radon Inspection': [
    { name: 'Radon Testing', items: [{ name: 'Test device placement' }, { name: 'Lowest livable area confirmed' }, { name: 'Closed house conditions verified' }] },
    { name: 'Mitigation System (if present)', items: [{ name: 'Sub-slab depressurization pipe' }, { name: 'Fan operation & label' }, { name: 'System integrity & no gaps' }, { name: 'Discharge point location' }] },
    { name: 'Foundation Assessment', items: [{ name: 'Sump pit cover (sealed)' }, { name: 'Visible cracks sealed' }, { name: 'Crawlspace membrane condition' }] },
  ],
  'Sewer Scope': [
    { name: 'Main Sewer Line', items: [{ name: 'Line material (cast iron/ABS/clay)' }, { name: 'Root intrusion observed' }, { name: 'Offset joints or bellies' }, { name: 'Deterioration or corrosion' }] },
    { name: 'Clean-out Access', items: [{ name: 'Clean-out location & access' }, { name: 'Clean-out cap condition' }] },
    { name: 'Connection to City Main', items: [{ name: 'Connection point observed' }, { name: 'Lateral condition at connection' }] },
  ],
}

// ── Sortable room row (used inside DnD context) ──
function SortableRoom({
  room, roomIdx, expandedRooms, toggleRoom, updateRoomName, removeRoom,
  addItem, removeItem, updateItem,
}: {
  room: TemplateRoom
  roomIdx: number
  expandedRooms: Set<number>
  toggleRoom: (i: number) => void
  updateRoomName: (i: number, v: string) => void
  removeRoom: (i: number) => void
  addItem: (i: number) => void
  removeItem: (ri: number, ii: number) => void
  updateItem: (ri: number, ii: number, v: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: room._id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className="border border-slate-100 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50">
        {/* Drag handle — only this element triggers drag */}
        <button
          {...attributes}
          {...listeners}
          className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Input
          className="flex-1 h-8 text-sm border-0 bg-transparent focus-visible:ring-0 px-0 font-medium"
          placeholder={`Room ${roomIdx + 1} name (e.g. Roofing System)`}
          value={room.name}
          onChange={(e) => updateRoomName(roomIdx, e.target.value)}
        />
        <button onClick={() => toggleRoom(roomIdx)} className="text-slate-400 hover:text-slate-600">
          {expandedRooms.has(roomIdx) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button onClick={() => removeRoom(roomIdx)} className="text-slate-300 hover:text-red-400">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expandedRooms.has(roomIdx) && (
        <div className="p-3 space-y-2">
          {room.items.map((item, itemIdx) => (
            <div key={itemIdx} className="flex items-center gap-2">
              <span className="text-slate-300 text-xs w-5 text-right">{itemIdx + 1}.</span>
              <Input
                className="flex-1 h-8 text-sm"
                placeholder="Inspection item (e.g. Roof covering material & condition)"
                value={item.name}
                onChange={(e) => updateItem(roomIdx, itemIdx, e.target.value)}
              />
              <button onClick={() => removeItem(roomIdx, itemIdx)} className="text-slate-300 hover:text-red-400">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => addItem(roomIdx)}
            className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1"
          >
            <Plus className="h-3 w-3" /> Add item
          </button>
        </div>
      )}
    </div>
  )
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<CustomTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<CustomTemplate | null>(null)
  const [isNew, setIsNew] = useState(false)

  // Editor state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editorRooms, setEditorRooms] = useState<TemplateRoom[]>([])
  const [saving, setSaving] = useState(false)
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set())

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = editorRooms.findIndex((r) => r._id === active.id)
    const newIdx = editorRooms.findIndex((r) => r._id === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    setEditorRooms(arrayMove(editorRooms, oldIdx, newIdx))
    // Keep expanded state consistent after reorder
    setExpandedRooms((prev) => {
      const arr = editorRooms.map((_, i) => prev.has(i))
      const moved = arrayMove(arr, oldIdx, newIdx)
      return new Set(moved.map((v, i) => v ? i : -1).filter((i) => i !== -1))
    })
  }

  useEffect(() => { loadTemplates() }, [])

  async function loadTemplates() {
    setLoading(true)
    try {
      const res = await fetch('/api/templates')
      const data = await res.json()
      setTemplates(data.templates ?? [])
    } finally {
      setLoading(false)
    }
  }

  function startNew() {
    setEditing(null)
    setIsNew(true)
    setName('')
    setDescription('')
    setEditorRooms([{ _id: crypto.randomUUID(), name: '', items: [{ name: '' }] }])
    setExpandedRooms(new Set([0]))
  }

  function startEdit(t: CustomTemplate) {
    setEditing(t)
    setIsNew(false)
    setName(t.name)
    setDescription(t.description ?? '')
    setEditorRooms(t.rooms.map((r) => ({ _id: r.id ?? crypto.randomUUID(), name: r.name, items: r.items.map((i) => ({ name: i.name })) })))
    setExpandedRooms(new Set(t.rooms.map((_, i) => i)))
  }

  function cancelEdit() {
    setEditing(null)
    setIsNew(false)
  }

  function applyPreset(presetKey: string) {
    const preset = INSPECTION_TYPE_PRESETS[presetKey]
    if (!preset) return
    const presetWithIds = preset.map((r) => ({ ...r, _id: crypto.randomUUID() }))
    setEditorRooms(presetWithIds)
    setExpandedRooms(new Set(presetWithIds.map((_, i) => i)))
    if (!name) setName(presetKey)
    toast.success(`Loaded ${presetKey} template`)
  }

  function addRoom() {
    const idx = editorRooms.length
    setEditorRooms([...editorRooms, { _id: crypto.randomUUID(), name: '', items: [{ name: '' }] }])
    setExpandedRooms((prev) => new Set([...prev, idx]))
  }

  function removeRoom(idx: number) {
    setEditorRooms(editorRooms.filter((_, i) => i !== idx))
    setExpandedRooms((prev) => {
      const next = new Set([...prev].filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)))
      return next
    })
  }

  function updateRoomName(idx: number, val: string) {
    const updated = [...editorRooms]
    updated[idx] = { ...updated[idx], name: val }
    setEditorRooms(updated)
  }

  function toggleRoom(idx: number) {
    setExpandedRooms((prev) => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  function addItem(roomIdx: number) {
    const updated = [...editorRooms]
    updated[roomIdx] = { ...updated[roomIdx], items: [...updated[roomIdx].items, { name: '' }] }
    setEditorRooms(updated)
  }

  function removeItem(roomIdx: number, itemIdx: number) {
    const updated = [...editorRooms]
    updated[roomIdx] = { ...updated[roomIdx], items: updated[roomIdx].items.filter((_, i) => i !== itemIdx) }
    setEditorRooms(updated)
  }

  function updateItem(roomIdx: number, itemIdx: number, val: string) {
    const updated = [...editorRooms]
    const items = [...updated[roomIdx].items]
    items[itemIdx] = { name: val }
    updated[roomIdx] = { ...updated[roomIdx], items }
    setEditorRooms(updated)
  }

  function addInterNACHIRoom(roomName: string) {
    const room = DEFAULT_ROOMS.find((r) => r.name === roomName)
    if (!room) return
    const idx = editorRooms.length
    setEditorRooms([...editorRooms, { _id: crypto.randomUUID(), name: room.name, items: room.items.map((i) => ({ name: i })) }])
    setExpandedRooms((prev) => new Set([...prev, idx]))
    toast.success(`Added ${room.name}`)
  }

  async function save() {
    if (!name.trim()) { toast.error('Template name is required'); return }
    const validRooms = editorRooms
      .filter((r) => r.name.trim())
      .map((r) => ({ name: r.name.trim(), items: r.items.filter((i) => i.name.trim()).map((i) => i.name.trim()) }))
    if (validRooms.length === 0) { toast.error('Add at least one room'); return }

    setSaving(true)
    try {
      const body = { name: name.trim(), description: description.trim(), rooms: validRooms }
      const res = editing
        ? await fetch(`/api/templates/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

      if (!res.ok) { toast.error('Failed to save template'); return }
      toast.success(editing ? 'Template updated!' : 'Template created!')
      cancelEdit()
      loadTemplates()
    } finally {
      setSaving(false)
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template? This cannot be undone.')) return
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    toast.success('Template deleted')
    loadTemplates()
  }

  const showEditor = isNew || !!editing

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inspection Templates</h1>
          <p className="text-slate-500 text-sm mt-0.5">Build custom templates for commercial, pool, radon, and any other inspection type</p>
        </div>
        {!showEditor && (
          <Button onClick={startNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />New Template
          </Button>
        )}
      </div>

      {/* ── Template Editor ── */}
      {showEditor && (
        <Card className="border-blue-100 shadow-sm mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editing ? 'Edit Template' : 'New Template'}</CardTitle>
              <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name + Description */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name *</Label>
                <Input placeholder="e.g. Commercial Building" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input placeholder="e.g. For light commercial & retail" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <Label className="text-slate-500 text-xs uppercase tracking-wide">Start from a preset</Label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(INSPECTION_TYPE_PRESETS).map((key) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-slate-600 transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Add InterNACHI room */}
            <div className="space-y-2">
              <Label className="text-slate-500 text-xs uppercase tracking-wide">Add an InterNACHI room</Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_ROOMS.map((r) => (
                  <button
                    key={r.name}
                    onClick={() => addInterNACHIRoom(r.name)}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50 text-slate-500 transition-colors"
                  >
                    + {r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Rooms editor — drag to reorder */}
            <div className="space-y-3">
              <Label className="text-slate-500 text-xs uppercase tracking-wide">Rooms & Inspection Items</Label>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={editorRooms.map((r) => r._id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {editorRooms.map((room, roomIdx) => (
                      <SortableRoom
                        key={room._id}
                        room={room}
                        roomIdx={roomIdx}
                        expandedRooms={expandedRooms}
                        toggleRoom={toggleRoom}
                        updateRoomName={updateRoomName}
                        removeRoom={removeRoom}
                        addItem={addItem}
                        removeItem={removeItem}
                        updateItem={updateItem}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <button onClick={addRoom} className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add room
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : 'Save Template'}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Template List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />Loading templates…
        </div>
      ) : templates.length === 0 && !showEditor ? (
        <Card className="border-dashed border-slate-200 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <LayoutTemplate className="h-10 w-10 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No custom templates yet</p>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">Create a template for commercial, pool, radon, or any specialty inspection type</p>
            <Button onClick={startNew} className="mt-6 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />Create your first template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <Card key={t.id} className="border-slate-100 shadow-sm hover:border-blue-100 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="h-4 w-4 text-blue-500 shrink-0" />
                      <p className="font-medium text-slate-900">{t.name}</p>
                    </div>
                    {t.description && <p className="text-sm text-slate-500 mt-0.5 ml-6">{t.description}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-6">
                      {t.rooms.map((r) => (
                        <span key={r.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {r.name} ({r.items.length})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(t)} className="text-slate-400 hover:text-slate-700">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteTemplate(t.id)} className="text-slate-300 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
