import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-slate-900">InspectIQ</span>
          </Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>Privacy Policy</h1>
        <p className="text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Information We Collect</h2>
        <p>We collect information you provide directly, including your name, email address, company name, and license number when you create an account. We also collect the inspection data you enter into the platform.</p>

        <h2>How We Use Your Information</h2>
        <p>We use your information to provide and improve the InspectIQ service, process payments through Stripe, and send transactional emails. We do not sell your data to third parties.</p>

        <h2>Data Storage</h2>
        <p>Your data is stored securely using Neon (PostgreSQL) hosted on AWS infrastructure. All data is encrypted at rest and in transit.</p>

        <h2>Payment Information</h2>
        <p>Payment processing is handled by Stripe. We do not store your credit card information on our servers.</p>

        <h2>Cookies</h2>
        <p>We use cookies solely for authentication purposes to keep you signed in to your account.</p>

        <h2>Contact</h2>
        <p>For privacy questions, contact us at <a href="mailto:support@inspectiq.app">support@inspectiq.app</a>.</p>
      </div>
    </div>
  )
}
