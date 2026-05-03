'use client'

import { useState } from 'react'

export default function AgreementForm({ token }: { token: string }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [signed, setSigned] = useState(false)
  const [error, setError] = useState('')

  async function handleSign() {
    if (!name.trim()) { setError('Please enter your full name'); return }
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`/api/agreement/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to sign agreement'); return }
      setSigned(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (signed) {
    return (
      <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
        <p className="text-green-700 font-semibold">Agreement Signed Successfully</p>
        <p className="text-sm text-green-600 mt-1">Thank you, {name}. You can close this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="signer-name" className="block text-sm font-medium text-slate-700 mb-1">
          Full Name
        </label>
        <input
          id="signer-name"
          type="text"
          placeholder="Enter your full legal name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSign() }}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleSign}
        disabled={submitting}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Signing...' : 'I Agree'}
      </button>
      <p className="text-xs text-slate-400 text-center">
        By clicking &quot;I Agree&quot;, you are electronically signing this agreement.
      </p>
    </div>
  )
}
