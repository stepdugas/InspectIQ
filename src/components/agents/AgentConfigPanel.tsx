'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Save } from 'lucide-react'

interface Props {
  agentType: string
  config: Record<string, unknown>
  onSave: (config: Record<string, unknown>) => void
  saving: boolean
}

export default function AgentConfigPanel({ agentType, config, onSave, saving }: Props) {
  const [local, setLocal] = useState<Record<string, unknown>>({ ...config })

  function set(key: string, value: unknown) {
    setLocal(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    onSave(local)
  }

  const fields = getFieldsForAgent(agentType, local, set)

  if (fields.length === 0) {
    return <p className="text-xs text-slate-400">No additional configuration needed.</p>
  }

  return (
    <div className="space-y-4">
      {fields}
      <Button size="sm" onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
        {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
        Save Settings
      </Button>
    </div>
  )
}

function getFieldsForAgent(
  type: string,
  config: Record<string, unknown>,
  set: (key: string, value: unknown) => void
): React.ReactNode[] {
  switch (type) {
    case 'report_writer':
      return [
        <SelectField key="tone" label="Tone" value={config.tone as string} onChange={v => set('tone', v)}
          options={[
            { value: 'professional', label: 'Professional' },
            { value: 'conversational', label: 'Conversational' },
            { value: 'brief', label: 'Brief' },
          ]} />,
        <CheckboxField key="auto" label="Auto-generate narrative when notes are saved" checked={config.autoGenerate as boolean} onChange={v => set('autoGenerate', v)} />,
      ]

    case 'delivery':
      return [
        <CheckboxField key="auto" label="Auto-send report on completion" checked={config.autoSend as boolean} onChange={v => set('autoSend', v)} />,
        <CheckboxField key="cc" label="CC buyer's agent" checked={config.ccBuyerAgent as boolean} onChange={v => set('ccBuyerAgent', v)} />,
        <CheckboxField key="pdf" label="Include PDF attachment" checked={config.includePdf as boolean} onChange={v => set('includePdf', v)} />,
      ]

    case 'follow_up':
      return [
        <SelectField key="timing" label="When to send" value={config.timing as string} onChange={v => set('timing', v)}
          options={[
            { value: 'same_evening', label: 'Same day evening' },
            { value: 'next_morning', label: 'Next morning' },
            { value: '48_hours', label: '48 hours later' },
            { value: 'custom', label: 'Custom timing' },
          ]} />,
        ...(config.timing === 'custom' ? [
          <NumberField key="hours" label="Hours after delivery" value={config.customHours as number} onChange={v => set('customHours', v)} />,
        ] : []),
        <SelectField key="content" label="What to include" value={config.content as string} onChange={v => set('content', v)}
          options={[
            { value: 'any_questions', label: '"Any questions?" (simple)' },
            { value: 'top_findings', label: 'Top 3-5 findings summary (AI-generated)' },
            { value: 'custom', label: 'Custom message' },
          ]} />,
        ...(config.content === 'custom' ? [
          <TextareaField key="msg" label="Custom message" value={config.customMessage as string} onChange={v => set('customMessage', v)} placeholder="Write your follow-up message..." />,
        ] : []),
        <SelectField key="tone" label="Tone" value={config.tone as string} onChange={v => set('tone', v)}
          options={[
            { value: 'professional', label: 'Professional' },
            { value: 'friendly', label: 'Friendly' },
            { value: 'brief', label: 'Brief' },
          ]} />,
        <CheckboxField key="phone" label="Include your phone number" checked={config.includePhone as boolean} onChange={v => set('includePhone', v)} />,
      ]

    case 'property_research':
      return [
        <CheckboxField key="auto" label="Auto-pull permits when inspection is created" checked={config.autoPull as boolean} onChange={v => set('autoPull', v)} />,
      ]

    case 'review':
      return [
        <NumberField key="delay" label="Days after follow-up to request review" value={config.delayDays as number} onChange={v => set('delayDays', v)} />,
        <CheckboxField key="followup" label="Send a reminder if no review after 5 days" checked={config.followUpIfNoReview as boolean} onChange={v => set('followUpIfNoReview', v)} />,
        <TextareaField key="msg" label="Custom review request message (optional)" value={config.customMessage as string} onChange={v => set('customMessage', v)} placeholder="Leave blank to use the default message" />,
      ]

    case 'realtor_nurture':
      return [
        <CheckboxField key="thankyou" label="Auto-send thank-you after referral" checked={config.autoThankYou as boolean} onChange={v => set('autoThankYou', v)} />,
        <NumberField key="inactive" label="Alert when realtor inactive for (days)" value={config.inactiveAlertDays as number} onChange={v => set('inactiveAlertDays', v)} />,
        <CheckboxField key="stats" label="Include inspection count in thank-you" checked={config.includeStats as boolean} onChange={v => set('includeStats', v)} />,
      ]

    case 'repair_summary':
      return [
        <CheckboxField key="auto" label="Auto-generate repair summary on completion" checked={config.autoGenerate as boolean} onChange={v => set('autoGenerate', v)} />,
        <SelectField key="format" label="Format" value={config.format as string} onChange={v => set('format', v)}
          options={[
            { value: 'bullet_list', label: 'Bullet list' },
            { value: 'detailed', label: 'Detailed with estimates' },
            { value: 'realtor_addendum', label: 'Realtor-ready addendum' },
          ]} />,
        <CheckboxField key="photos" label="Include photos" checked={config.includePhotos as boolean} onChange={v => set('includePhotos', v)} />,
      ]

    case 'scheduling':
      return [
        <NumberField key="buffer" label="Buffer between inspections (minutes)" value={config.bufferMinutes as number} onChange={v => set('bufferMinutes', v)} />,
        <NumberField key="max" label="Max inspections per day" value={config.maxPerDay as number} onChange={v => set('maxPerDay', v)} />,
        <NumberField key="area" label="Service area (miles)" value={config.serviceAreaMiles as number} onChange={v => set('serviceAreaMiles', v)} />,
        <CheckboxField key="confirm" label="Auto-confirm bookings" checked={config.autoConfirm as boolean} onChange={v => set('autoConfirm', v)} />,
      ]

    case 'compliance':
      return [
        <p key="info" className="text-xs text-slate-500">Reminder schedule: 30, 14, 7, and 1 day before each deadline. Configure your license and CE details in Settings.</p>,
      ]

    case 'lead_qualifier':
      return [
        <CheckboxField key="auto" label="Auto-respond to new inquiries" checked={config.autoRespond as boolean} onChange={v => set('autoRespond', v)} />,
        <SelectField key="pricing" label="Pricing model" value={config.pricingModel as string} onChange={v => set('pricingModel', v)}
          options={[
            { value: 'flat', label: 'Flat rate' },
            { value: 'per_sqft', label: 'Per square foot' },
            { value: 'custom', label: 'Custom (no auto-quote)' },
          ]} />,
        ...(config.pricingModel === 'flat' ? [
          <NumberField key="flat" label="Flat rate ($)" value={config.flatRate as number} onChange={v => set('flatRate', v)} />,
        ] : []),
        ...(config.pricingModel === 'per_sqft' ? [
          <NumberField key="sqft" label="Price per sq ft ($)" value={config.perSqftRate as number} onChange={v => set('perSqftRate', v)} />,
        ] : []),
      ]

    case 'business_intel':
      return [
        <SelectField key="freq" label="Report frequency" value={config.frequency as string} onChange={v => set('frequency', v)}
          options={[
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]} />,
        <CheckboxField key="revenue" label="Include revenue data" checked={config.includeRevenue as boolean} onChange={v => set('includeRevenue', v)} />,
        <CheckboxField key="realtors" label="Include realtor pipeline" checked={config.includeRealtorPipeline as boolean} onChange={v => set('includeRealtorPipeline', v)} />,
      ]

    case 'after_hours':
      return [
        <div key="hours" className="grid grid-cols-2 gap-3">
          <InputField label="Business hours start" value={config.businessHoursStart as string} onChange={v => set('businessHoursStart', v)} type="time" />
          <InputField label="Business hours end" value={config.businessHoursEnd as string} onChange={v => set('businessHoursEnd', v)} type="time" />
        </div>,
        <CheckboxField key="book" label="Allow booking appointments" checked={config.canBookAppointments as boolean} onChange={v => set('canBookAppointments', v)} />,
      ]

    case 'marketing':
      return [
        <CheckboxField key="auto" label="Auto-post to Google Business Profile" checked={config.autoPost as boolean} onChange={v => set('autoPost', v)} />,
        <NumberField key="freq" label="Post every (days)" value={config.frequencyDays as number} onChange={v => set('frequencyDays', v)} />,
        <CheckboxField key="anon" label="Anonymize property addresses" checked={config.anonymizeAddresses as boolean} onChange={v => set('anonymizeAddresses', v)} />,
      ]

    default:
      return []
  }
}

// Reusable field components

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <Label className="text-xs text-slate-600 mb-1">{label}</Label>
      <Select value={value ?? ''} onValueChange={(v: string | null) => { if (v) onChange(v) }}>
        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={checked ?? false} onCheckedChange={onChange} />
      <Label className="text-sm text-slate-700 cursor-pointer" onClick={() => onChange(!checked)}>{label}</Label>
    </div>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Label className="text-xs text-slate-600 mb-1">{label}</Label>
      <Input type="number" value={value ?? 0} onChange={e => onChange(Number(e.target.value))} className="h-9 text-sm w-32" />
    </div>
  )
}

function InputField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="text-xs text-slate-600 mb-1">{label}</Label>
      <Input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} className="h-9 text-sm" />
    </div>
  )
}

function TextareaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label className="text-xs text-slate-600 mb-1">{label}</Label>
      <Textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="text-sm min-h-[80px]" />
    </div>
  )
}
