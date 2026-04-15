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
import { Loader2, CreditCard, CheckCircle2, Upload, Building2, PenLine } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null)
  const [signatureUploading, setSignatureUploading] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [hasStripeCustomer, setHasStripeCustomer] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/profile')
      const data = await res.json()
      if (data.profile) {
        setFullName(data.profile.fullName ?? '')
        setCompanyName(data.profile.companyName ?? '')
        setLicenseNumber(data.profile.licenseNumber ?? '')
        setPhone(data.profile.phone ?? '')
        setLogoUrl(data.profile.logoUrl ?? null)
        setSignatureUrl(data.profile.signatureUrl ?? null)
        setReferralCode(data.profile.referralCode ?? null)
        setSubscriptionStatus(data.profile.subscriptionStatus)
        setHasStripeCustomer(!!data.profile.stripeCustomerId)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function saveProfile() {
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, companyName, licenseNumber, phone }),
    })
    if (res.ok) toast.success('Profile saved!')
    else toast.error('Failed to save')
    setSaving(false)
  }

  async function handleSubscribe() {
    setCheckoutLoading(true)
    const res = await fetch('/api/stripe/create-checkout', { method: 'POST' })
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
      const uploadData = await uploadRes.json()
      const url = uploadData.secure_url

      // Save to profile
      await fetch('/api/upload/logo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logoUrl: url }) })
      setLogoUrl(url)
      toast.success('Logo uploaded!')
    } catch {
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
      const uploadData = await uploadRes.json()
      const url = uploadData.secure_url
      await fetch('/api/upload/signature', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signatureUrl: url }) })
      setSignatureUrl(url)
      toast.success('Signature saved!')
    } catch {
      toast.error('Upload failed')
    } finally {
      setSignatureUploading(false)
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
          <div className="grid grid-cols-2 gap-4">
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

          {/* Signature upload */}
          <div className="space-y-2">
            <Label>Inspector Signature</Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-40 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {signatureUrl
                  ? <img src={signatureUrl} alt="Signature" className="w-full h-full object-contain p-2" />
                  : <PenLine className="h-5 w-5 text-slate-300" />
                }
              </div>
              <div>
                <input ref={signatureInputRef} type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                <Button type="button" variant="outline" size="sm" onClick={() => signatureInputRef.current?.click()} disabled={signatureUploading}>
                  {signatureUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {signatureUrl ? 'Change Signature' : 'Upload Signature'}
                </Button>
                <p className="text-xs text-slate-400 mt-1">Appears at the bottom of every PDF report</p>
              </div>
            </div>
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
            <div>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 mb-4">
                <p className="text-sm font-medium text-slate-900">No active subscription</p>
                <p className="text-xs text-slate-500 mt-1">Subscribe to continue generating reports</p>
              </div>
              <Button onClick={handleSubscribe} disabled={checkoutLoading} className="bg-blue-600 hover:bg-blue-700">
                {checkoutLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
                Subscribe — $99/month
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
