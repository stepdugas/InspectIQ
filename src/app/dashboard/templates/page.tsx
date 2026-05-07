'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, Pencil, LayoutTemplate, X, GripVertical, Eye, MapPin, Shield, CheckCircle2 } from 'lucide-react'
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
import { DEFAULT_ROOMS, SYSTEM_TEMPLATES, US_STATES } from '@/lib/inspection-templates'
import type { SystemTemplate } from '@/lib/inspection-templates'

interface TemplateItem {
  id?: string
  name: string
}

interface TemplateRoom {
  id?: string
  _id: string
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

// Specialty presets for custom template editor
const SPECIALTY_PRESETS: Record<string, Omit<TemplateRoom, '_id'>[]> = {
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

// ── Badge component ──
function BadgeLabel({ color, children }: { color: 'red' | 'blue' | 'gray'; children: React.ReactNode }) {
  const colors = {
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    gray: 'bg-slate-100 text-slate-600 border-slate-200',
  }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors[color]}`}>
      {children}
    </span>
  )
}

// ── Preview Modal ──
function PreviewModal({ template, onClose }: { template: SystemTemplate; onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={template.name} onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">{template.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <BadgeLabel color={template.badgeColor}>{template.badge}</BadgeLabel>
              {template.summaryPageRequired && (
                <span className="text-[10px] text-amber-600 font-medium">Summary page required</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-slate-500">{template.description}</p>
          <p className="text-xs text-slate-400">
            {template.rooms.length} sections · {template.rooms.reduce((a, r) => a + r.items.length, 0)} inspection points
          </p>
          <div className="space-y-3">
            {template.rooms.map((room) => (
              <div key={room.name} className="border border-slate-100 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-slate-50">
                  <p className="text-sm font-medium text-slate-700">{room.name}</p>
                </div>
                <div className="px-3 py-2 space-y-1">
                  {room.items.map((item, i) => (
                    <p key={i} className="text-xs text-slate-500 pl-2">
                      <span className="text-slate-300 mr-1.5">{i + 1}.</span>{item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── System Template Card ──
function SystemTemplateCard({ template, onPreview, isDefault, onSetDefault, settingDefault }: { template: SystemTemplate; onPreview: (t: SystemTemplate) => void; isDefault?: boolean; onSetDefault?: (id: string) => void; settingDefault?: boolean }) {
  const totalItems = template.rooms.reduce((a, r) => a + r.items.length, 0)
  return (
    <Card className={`shadow-sm transition-colors ${isDefault ? 'border-blue-300 bg-blue-50/30' : 'border-slate-100 hover:border-blue-200'}`}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-slate-900 text-sm">{template.name}</p>
              <BadgeLabel color={template.badgeColor}>{template.badge}</BadgeLabel>
              {isDefault && <BadgeLabel color="blue">Your default</BadgeLabel>}
              {template.summaryPageRequired && (
                <span className="text-[10px] text-amber-600 font-medium">+ Summary</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">{template.description}</p>
            <p className="text-xs text-slate-400 mt-1">{template.rooms.length} sections · {totalItems} items</p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onPreview(template)} className="text-slate-400 hover:text-blue-600">
              <Eye className="h-4 w-4 mr-1" />Preview
            </Button>
            {onSetDefault && !isDefault && (
              <Button variant="ghost" size="sm" onClick={() => onSetDefault(template.id)} disabled={settingDefault} className="text-slate-400 hover:text-blue-600 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Set as default
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
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

  // State selector
  const [selectedState, setSelectedState] = useState('')

  // Default template
  const [defaultTemplateId, setDefaultTemplateId] = useState('')
  const [settingDefault, setSettingDefault] = useState(false)

  // Preview modal
  const [previewTemplate, setPreviewTemplate] = useState<SystemTemplate | null>(null)

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
    setExpandedRooms((prev) => {
      const arr = editorRooms.map((_, i) => prev.has(i))
      const moved = arrayMove(arr, oldIdx, newIdx)
      return new Set(moved.map((v, i) => v ? i : -1).filter((i) => i !== -1))
    })
  }

  useEffect(() => { loadTemplates(); loadProfile() }, [])

  async function loadProfile() {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      if (data.profile?.inspectionState) setSelectedState(data.profile.inspectionState)
      if (data.profile?.defaultTemplateId) setDefaultTemplateId(data.profile.defaultTemplateId)
    } catch { /* profile load is non-critical */ }
  }

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

  async function setAsDefault(templateId: string) {
    setSettingDefault(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultTemplateId: templateId }),
      })
      if (!res.ok) { toast.error('Failed to set default template'); return }
      setDefaultTemplateId(templateId)
      const tmpl = SYSTEM_TEMPLATES.find((t) => t.id === templateId)
      toast.success(`${tmpl?.name ?? 'Template'} set as your default`)
      console.log(`[InspectIQ] Default template set to ${templateId}`)
    } catch {
      toast.error('Failed to set default template')
    } finally {
      setSettingDefault(false)
    }
  }

  function startNew(presetKey?: string) {
    setEditing(null)
    setIsNew(true)
    if (presetKey && SPECIALTY_PRESETS[presetKey]) {
      const preset = SPECIALTY_PRESETS[presetKey]
      const presetWithIds = preset.map((r) => ({ ...r, _id: crypto.randomUUID() }))
      setName(presetKey)
      setDescription('')
      setEditorRooms(presetWithIds)
      setExpandedRooms(new Set(presetWithIds.map((_, i) => i)))
    } else {
      setName('')
      setDescription('')
      setEditorRooms([{ _id: crypto.randomUUID(), name: '', items: [{ name: '' }] }])
      setExpandedRooms(new Set([0]))
    }
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
    const preset = SPECIALTY_PRESETS[presetKey]
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

  // Derive state-specific recommendations
  const stateInfo = US_STATES.find((s) => s.code === selectedState)
  const recommendedTemplates = stateInfo
    ? stateInfo.recommendedTemplates
        .map((id) => SYSTEM_TEMPLATES.find((t) => t.id === id))
        .filter(Boolean) as SystemTemplate[]
    : []

  // Templates not shown in recommendations
  const otherSystemTemplates = selectedState
    ? SYSTEM_TEMPLATES.filter((t) => !stateInfo?.recommendedTemplates.includes(t.id))
    : SYSTEM_TEMPLATES

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inspection Templates</h1>
          <p className="text-slate-500 text-sm mt-0.5">Built-in standards, state-compliant templates, and custom checklists</p>
        </div>
      </div>

      {/* ── State Selector ── */}
      <Card className="border-slate-100 shadow-sm mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
            <div className="flex-1">
              <Label htmlFor="state-select" className="text-sm font-medium text-slate-700">What state do you inspect in?</Label>
              <p className="text-xs text-slate-400">We&apos;ll recommend the right template for your state&apos;s requirements</p>
            </div>
            <select
              id="state-select"
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inspectionState: e.target.value || null }) }) }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-300 outline-none min-w-[180px]"
            >
              <option value="">Select your state</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ── State Recommendations ── */}
      {selectedState && stateInfo && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-700">
              Recommended for {stateInfo.name}
            </h2>
            <BadgeLabel color={stateInfo.regulation === 'mandatory_form' ? 'red' : stateInfo.regulation === 'licensed' ? 'blue' : 'gray'}>
              {stateInfo.regulation === 'mandatory_form' ? 'State-mandated form' : stateInfo.regulation === 'licensed' ? 'Licensed state' : 'No state regulation'}
            </BadgeLabel>
          </div>
          {stateInfo.regulation === 'unlicensed' && (
            <p className="text-xs text-slate-400 mb-3">
              {stateInfo.name} does not regulate home inspectors. Any standard report format is accepted — we recommend InterNACHI or ASHI SOP.
            </p>
          )}
          <div className="space-y-3">
            {recommendedTemplates.map((t) => (
              <SystemTemplateCard key={t.id} template={t} onPreview={setPreviewTemplate} isDefault={defaultTemplateId === t.id} onSetDefault={setAsDefault} settingDefault={settingDefault} />
            ))}
          </div>
        </div>
      )}

      {/* ── All Built-in Templates ── */}
      {(!selectedState || otherSystemTemplates.length > 0) && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            {selectedState ? 'Other available templates' : 'Built-in residential templates'}
          </h2>
          <div className="space-y-3">
            {(selectedState ? otherSystemTemplates : SYSTEM_TEMPLATES).map((t) => (
              <SystemTemplateCard key={t.id} template={t} onPreview={setPreviewTemplate} isDefault={defaultTemplateId === t.id} onSetDefault={setAsDefault} settingDefault={settingDefault} />
            ))}
          </div>
        </div>
      )}

      {/* ── Specialty Inspections ── */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">Specialty inspections</h2>
        <p className="text-xs text-slate-400 mb-3">Create a custom template from a specialty preset</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.keys(SPECIALTY_PRESETS).map((key) => {
            const preset = SPECIALTY_PRESETS[key]
            const totalItems = preset.reduce((a, r) => a + r.items.length, 0)
            return (
              <button
                key={key}
                onClick={() => startNew(key)}
                className="text-left p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
              >
                <p className="text-sm font-medium text-slate-700">{key}</p>
                <p className="text-xs text-slate-400 mt-0.5">{preset.length} rooms · {totalItems} items</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Custom Templates Section ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Your custom templates</h2>
            <p className="text-xs text-slate-400">Templates you&apos;ve created for your specific needs</p>
          </div>
          {!showEditor && (
            <Button onClick={() => startNew()} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5 mr-1.5" />New
            </Button>
          )}
        </div>

        {/* ── Template Editor ── */}
        {showEditor && (
          <Card className="border-blue-100 shadow-sm mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{editing ? 'Edit Template' : 'New Custom Template'}</CardTitle>
                <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name *</Label>
                  <Input placeholder="e.g. Commercial Building" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input placeholder="e.g. For light commercial & retail" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>

              {/* Specialty presets */}
              <div className="space-y-2">
                <Label className="text-slate-500 text-xs uppercase tracking-wide">Start from a preset</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SPECIALTY_PRESETS).map((key) => (
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

              {/* Rooms editor */}
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
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Template'}
                </Button>
                <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Custom Template List ── */}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />Loading...
          </div>
        ) : templates.length === 0 && !showEditor ? (
          <Card className="border-dashed border-slate-200 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <LayoutTemplate className="h-8 w-8 text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm font-medium">No custom templates yet</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs">Use the specialty presets above or build your own from scratch</p>
              <Button onClick={() => startNew()} size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-3.5 w-3.5 mr-1.5" />Create template
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
                        <p className="font-medium text-slate-900 text-sm">{t.name}</p>
                      </div>
                      {t.description && <p className="text-xs text-slate-500 mt-0.5 ml-6">{t.description}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-6">
                        {t.rooms.map((r) => (
                          <span key={r.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {r.name} ({r.items.length})
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
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

      {/* ── Preview Modal ── */}
      {previewTemplate && (
        <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}
    </div>
  )
}
