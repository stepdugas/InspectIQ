'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, CreditCard, CheckCircle2, Upload, Building2, PenLine, Link2, Link2Off, Star, ExternalLink, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import SignaturePad from '@/components/SignaturePad'
import { US_STATES, SYSTEM_TEMPLATES } from '@/lib/inspection-templates'

const ISN_ENABLED = process.env.NEXT_PUBLIC_ISN_ENABLED === 'true'

export default function SettingsPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [inspectionState, setInspectionState] = useState('')
  const [defaultTemplateId, setDefaultTemplateId] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null)
  const [signatureUploading, setSignatureUploading] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [foundingMemberNumber, setFoundingMemberNumber] = useState<number | null>(null)
  // ISN integration state
  const [isnConnected, setIsnConnected] = useState(false)
  const [isnCompanyKey, setIsnCompanyKey] = useState('')
  const [isnUsername, setIsnUsername] = useState('')
  const [isnPassword, setIsnPassword] = useState('')
  const [isnDomain, setIsnDomain] = useState('')
  const [isnConnecting, setIsnConnecting] = useState(false)
  const [isnDisconnecting, setIsnDisconnecting] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [hasStripeCustomer, setHasStripeCustomer] = useState(false)
  // Stripe Connect state
  const [stripeConnectOnboarded, setStripeConnectOnboarded] = useState(false)
  const [stripeConnectLoading, setStripeConnectLoading] = useState(false)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [signatureSaving, setSignatureSaving] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const [profileRes, connectRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/stripe/connect'),
      ])
      const data = await profileRes.json()
      const connectData = await connectRes.json()
      if (data.profile) {
        setFullName(data.profile.fullName ?? '')
        setCompanyName(data.profile.companyName ?? '')
        setLicenseNumber(data.profile.licenseNumber ?? '')
        setPhone(data.profile.phone ?? '')
        setInspectionState(data.profile.inspectionState ?? '')
        setDefaultTemplateId(data.profile.defaultTemplateId ?? '')
        setLogoUrl(data.profile.logoUrl ?? null)
        setSignatureUrl(data.profile.signatureUrl ?? null)
        setReferralCode(data.profile.referralCode ?? null)
        setSubscriptionStatus(data.profile.subscriptionStatus)
        setFoundingMemberNumber(data.profile.foundingMemberNumber ?? null)
        setHasStripeCustomer(!!data.profile.stripeCustomerId)
        setIsnConnected(!!data.profile.isnCompanyKey)
        if (data.profile.isnCompanyKey) setIsnCompanyKey(data.profile.isnCompanyKey)
        if (data.profile.isnUsername) setIsnUsername(data.profile.isnUsername)
      }
      setStripeConnectOnboarded(connectData.onboarded === true)
      setLoading(false)
    }
    load()

    // Show success toast if returning from Stripe Connect onboarding
    const params = new URLSearchParams(window.location.search)
    if (params.get('stripe_connect') === 'complete') {
      toast.success('Stripe account connected! You can now collect client payments.')
      window.history.replaceState({}, '', '/dashboard/settings')
    } else if (params.get('stripe_connect') === 'refresh') {
      toast.info('Stripe setup incomplete — click Connect again to finish.')
      window.history.replaceState({}, '', '/dashboard/settings')
    }
  }, [])

  async function saveProfile() {
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, companyName, licenseNumber, phone, inspectionState: inspectionState || null, defaultTemplateId: defaultTemplateId || null }),
    })
    if (res.ok) toast.success('Profile saved!')
    else toast.error('Failed to save')
    setSaving(false)
  }

  async function handleSubscribe(plan: 'monthly' | 'annual' = 'monthly') {
    setCheckoutLoading(true)
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else { toast.error('Failed to start checkout'); setCheckoutLoading(false) }
  }

  async function handleManageBilling() {
    setPortalLoading(true)
    const res = await fetch('/api/stripe/customer-portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else { toast.error('Failed to open billing portal'); setPortalLoading(false) }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      // Get signed upload params
      const paramsRes = await fetch('/api/upload/logo')
      if (!paramsRes.ok) { toast.error('Failed to prepare upload'); return }
      const { signature, timestamp, folder, public_id, cloudName, apiKey } = await paramsRes.json()

      // Upload directly to Cloudinary
      const form = new FormData()
      form.append('file', file)
      form.append('signature', signature)
      form.append('timestamp', timestamp)
      form.append('folder', folder)
      form.append('public_id', public_id)
      form.append('overwrite', 'true')
      form.append('api_key', apiKey)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form })
      if (!uploadRes.ok) { toast.error('Upload to storage failed'); return }
      const uploadData = await uploadRes.json()
      const url = uploadData.secure_url

      // Save to profile
      await fetch('/api/upload/logo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logoUrl: url }) })
      setLogoUrl(url)
      toast.success('Logo uploaded!')
      console.log('[InspectIQ] Logo uploaded successfully')
    } catch (err) {
      console.error('[InspectIQ] Logo upload error:', err)
      toast.error('Upload failed')
    } finally {
      setLogoUploading(false)
    }
  }

  async function handleSignatureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSignatureUploading(true)
    try {
      const paramsRes = await fetch('/api/upload/signature')
      if (!paramsRes.ok) { toast.error('Failed to prepare upload'); return }
      const { signature, timestamp, folder, public_id, cloudName, apiKey } = await paramsRes.json()
      const form = new FormData()
      form.append('file', file)
      form.append('signature', signature)
      form.append('timestamp', timestamp)
      form.append('folder', folder)
      form.append('public_id', public_id)
      form.append('overwrite', 'true')
      form.append('api_key', apiKey)
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form })
      if (!uploadRes.ok) { toast.error('Upload to storage failed'); return }
      const uploadData = await uploadRes.json()
      const url = uploadData.secure_url
      await fetch('/api/upload/signature', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signatureUrl: url }) })
      setSignatureUrl(url)
      toast.success('Signature saved!')
      console.log('[InspectIQ] Signature uploaded successfully')
    } catch (err) {
      console.error('[InspectIQ] Signature upload error:', err)
      toast.error('Upload failed')
    } finally {
      setSignatureUploading(false)
    }
  }

  async function connectIsn() {
    if (!isnCompanyKey || !isnUsername || !isnPassword) {
      toast.error('Please fill in all ISN fields')
      return
    }
    setIsnConnecting(true)
    try {
      const res = await fetch('/api/isn/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyKey: isnCompanyKey, username: isnUsername, password: isnPassword, domain: isnDomain || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to connect ISN'); return }
      setIsnConnected(true)
      setIsnPassword('')
      toast.success('ISN connected successfully!')
    } catch {
      toast.error('Failed to connect ISN')
    } finally {
      setIsnConnecting(false)
    }
  }

  async function disconnectIsn() {
    setIsnDisconnecting(true)
    const res = await fetch('/api/isn/connect', { method: 'DELETE' })
    if (res.ok) {
      setIsnConnected(false)
      setIsnCompanyKey('')
      setIsnUsername('')
      setIsnPassword('')
      setIsnDomain('')
      toast.success('ISN disconnected')
    } else {
      toast.error('Failed to disconnect')
    }
    setIsnDisconnecting(false)
  }

  async function saveDrawnSignature(dataUrl: string) {
    setSignatureSaving(true)
    try {
      // Get signed upload params from our API
      const paramsRes = await fetch('/api/upload/signature')
      if (!paramsRes.ok) { toast.error('Failed to prepare upload'); return }
      const { signature, timestamp, folder, public_id, cloudName, apiKey } = await paramsRes.json()

      // Convert data URL to blob for upload
      const blob = await (await fetch(dataUrl)).blob()

      const form = new FormData()
      form.append('file', blob)
      form.append('signature', signature)
      form.append('timestamp', timestamp)
      form.append('folder', folder)
      form.append('public_id', public_id)
      form.append('overwrite', 'true')
      form.append('api_key', apiKey)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form })
      if (!uploadRes.ok) { toast.error('Upload to storage failed'); return }
      const uploadData = await uploadRes.json()
      const url = uploadData.secure_url

      // Save URL to profile
      await fetch('/api/upload/signature', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signatureUrl: url }) })
      setSignatureUrl(url)
      setShowSignaturePad(false)
      toast.success('Signature saved!')
      console.log('[InspectIQ] Signature saved successfully')
    } catch (err) {
      console.error('[InspectIQ] Signature save error:', err)
      toast.error('Failed to save signature')
    } finally {
      setSignatureSaving(false)
    }
  }

  async function startStripeConnect() {
    setStripeConnectLoading(true)
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { toast.error('Failed to start Stripe setup'); setStripeConnectLoading(false) }
    } catch {
      toast.error('Failed to start Stripe setup')
      setStripeConnectLoading(false)
    }
  }

  function copyReferralLink() {
    const link = `${window.location.origin}/?ref=${referralCode}`
    navigator.clipboard.writeText(link).then(() => toast.success('Referral link copied!')).catch(() => toast.error('Could not copy'))
  }

  const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile and subscription</p>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Inspector Profile</CardTitle>
          <CardDescription>This info appears on every report you generate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Smith Home Inspections" />
            </div>
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="HI-12345" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 000-0000" />
            </div>
            <div className="space-y-2">
              <Label>Your State</Label>
              <select
                value={inspectionState}
                onChange={(e) => setInspectionState(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-300 outline-none"
              >
                <option value="">Select your state</option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400">We&apos;ll recommend the right template for your state</p>
            </div>
            <div className="space-y-2">
              <Label>Default Template</Label>
              <select
                value={defaultTemplateId}
                onChange={(e) => setDefaultTemplateId(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-300 outline-none"
              >
                <option value="">Auto (based on state)</option>
                {SYSTEM_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400">Pre-selected when you create a new inspection</p>
            </div>
          </div>
          <div className="text-sm text-slate-400">Email: {user?.emailAddresses[0]?.emailAddress}</div>

          {/* Logo upload */}
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {logoUrl
                  ? <img src={logoUrl} alt="Company logo" className="w-full h-full object-contain p-1" />
                  : <Building2 className="h-6 w-6 text-slate-300" />
                }
              </div>
              <div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={logoUploading}>
                  {logoUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {logoUrl ? 'Change Logo' : 'Upload Logo'}
                </Button>
                <p className="text-xs text-slate-400 mt-1">PNG or JPG, appears on every report</p>
              </div>
            </div>
          </div>

          {/* Signature — draw or upload */}
          <div className="space-y-2">
            <Label>Inspector Signature</Label>
            {showSignaturePad ? (
              <SignaturePad
                onSave={saveDrawnSignature}
                onCancel={() => setShowSignaturePad(false)}
                saving={signatureSaving}
              />
            ) : (
              <>
                {signatureUrl && (
                  <div className="h-20 w-full max-w-xs rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                    <img src={signatureUrl} alt="Signature" className="w-full h-full object-contain p-3" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowSignaturePad(true)}>
                    <PenLine className="h-4 w-4 mr-2" />
                    {signatureUrl ? 'Redraw' : 'Draw Signature'}
                  </Button>
                  <input ref={signatureInputRef} type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                  <Button type="button" variant="ghost" size="sm" onClick={() => signatureInputRef.current?.click()} disabled={signatureUploading}>
                    {signatureUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload Image
                  </Button>
                </div>
                <p className="text-xs text-slate-400">Appears at the bottom of every PDF report</p>
              </>
            )}
          </div>

          <Button onClick={saveProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-slate-100 shadow-sm">
        <CardHeader><CardTitle className="text-base">Subscription</CardTitle></CardHeader>
        <CardContent>
          {isActive ? (
            <div className="space-y-3">
              {foundingMemberNumber !== null && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      Founding Member #{foundingMemberNumber}
                    </p>
                    <p className="text-xs text-slate-500">Your $99/month rate is locked in forever — even when prices go up.</p>
                  </div>
                  <Badge className="ml-auto bg-amber-100 text-amber-700 border-amber-200 shrink-0">Locked</Badge>
                </div>
              )}
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {subscriptionStatus === 'trialing' ? 'Free Trial Active' : 'Pro — Active'}
                    </p>
                    <p className="text-xs text-slate-500">Unlimited inspections & reports</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-100">
                  {subscriptionStatus === 'trialing' ? 'Trial' : 'Active'}
                </Badge>
              </div>
              {hasStripeCustomer && (
                <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={portalLoading}>
                  {portalLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
                  Manage Billing & Cancel
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-sm font-medium text-slate-900">No active subscription</p>
                <p className="text-xs text-slate-500 mt-1">Subscribe to continue generating reports</p>
              </div>
              <Button onClick={() => handleSubscribe('monthly')} disabled={checkoutLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                {checkoutLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
                Subscribe Monthly — $99/mo
              </Button>
              <Button onClick={() => handleSubscribe('annual')} disabled={checkoutLoading} variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                {checkoutLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
                Subscribe Annually — $79/mo
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Save $240</span>
              </Button>
              <p className="text-xs text-slate-400 text-center">Annual = $948 billed once per year</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Stripe Connect — Client Payments */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-500" />
            Client Payments
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to collect inspection fees directly from clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stripeConnectOnboarded ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Stripe Connected</p>
                  <p className="text-xs text-slate-500">Client payments go directly to your bank account.</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                3% InspectIQ platform fee + Stripe processing (2.9% + 30¢) on each client payment. Payouts arrive in 2 business days.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
                  <p>Click below to open Stripe&apos;s secure onboarding page.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
                  <p>Enter your business details and bank account. Stripe handles everything — InspectIQ never sees your banking info.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
                  <p>Once connected, generate payment links on any inspection and clients pay you directly.</p>
                </div>
              </div>
              <Button onClick={startStripeConnect} disabled={stripeConnectLoading} className="bg-blue-600 hover:bg-blue-700">
                {stripeConnectLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                Connect Stripe Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Referral Program */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Refer & Earn</CardTitle>
          <CardDescription>Share your link with other inspectors. Every inspector who subscribes earns you a free month ($99 credit on your next bill).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-mono truncate">
                  {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralCode}` : `https://useinspectiq.com/?ref=${referralCode}`}
                </div>
                <Button variant="outline" size="sm" onClick={copyReferralLink} className="shrink-0">
                  <Link2 className="h-4 w-4 mr-1.5" />
                  Copy
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                Referred users get a 30-day trial (vs. the standard 14 days). Credits apply automatically — no tracking needed on your end.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Loading referral link...</p>
          )}
        </CardContent>
      </Card>

      {ISN_ENABLED && (
        <>
          <Separator />
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">ISN Integration</CardTitle>
              <CardDescription>
                Connect your Inspection Support Network account to auto-import jobs and sync reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isnConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">ISN Connected</p>
                      <p className="text-xs text-slate-500">Company key: {isnCompanyKey} · {isnUsername}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={disconnectIsn} disabled={isnDisconnecting}>
                    {isnDisconnecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2Off className="h-4 w-4 mr-2" />}
                    Disconnect ISN
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-2">
                      <Label>Company Key</Label>
                      <Input
                        placeholder="e.g. smithinspections"
                        value={isnCompanyKey}
                        onChange={(e) => setIsnCompanyKey(e.target.value)}
                      />
                      <p className="text-xs text-slate-400">Found in your ISN URL — inspectionsupport.net/<strong>yourkey</strong>/rest</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Custom Domain <span className="text-slate-400 font-normal">(optional)</span></Label>
                      <Input
                        placeholder="inspectionsupport.net"
                        value={isnDomain}
                        onChange={(e) => setIsnDomain(e.target.value)}
                      />
                      <p className="text-xs text-slate-400">Only needed if your ISN is on a custom domain. Leave blank for standard accounts.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>ISN Username</Label>
                      <Input
                        placeholder="Your ISN login username"
                        value={isnUsername}
                        onChange={(e) => setIsnUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ISN Password</Label>
                      <Input
                        type="password"
                        placeholder="Your ISN login password"
                        value={isnPassword}
                        onChange={(e) => setIsnPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={connectIsn} disabled={isnConnecting} className="bg-blue-600 hover:bg-blue-700">
                    {isnConnecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
                    Connect ISN Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

    </div>
  )
}
