import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function TermsPage() {
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
        <h1>Terms of Service</h1>
        <p className="text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Acceptance of Terms</h2>
        <p>By using InspectIQ, you agree to these Terms of Service. If you do not agree, do not use the service.</p>

        <h2>Service Description</h2>
        <p>InspectIQ is a software-as-a-service platform that helps home inspectors create professional inspection reports using AI-assisted narrative generation and PDF export tools.</p>

        <h2>Subscription and Billing</h2>
        <p>InspectIQ is offered on a subscription basis at $99/month with a 14-day free trial. Subscriptions renew automatically. You may cancel at any time from your account settings. No refunds are provided for partial months.</p>

        <h2>Acceptable Use</h2>
        <p>You agree to use InspectIQ only for lawful purposes and in connection with legitimate home inspection business activities. You are responsible for the accuracy of the inspection data you enter.</p>

        <h2>Intellectual Property</h2>
        <p>InspectIQ and its original content are the property of the service operator. Inspection reports generated using your data are owned by you.</p>

        <h2>Disclaimers</h2>
        <p>InspectIQ is a tool to assist in report writing. The AI-generated narratives are a starting point and should be reviewed by a licensed inspector before delivery to clients. InspectIQ is not responsible for the accuracy of AI-generated content.</p>

        <h2>Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, InspectIQ shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>

        <h2>Contact</h2>
        <p>Questions about these Terms? Contact us at <a href="mailto:support@inspectiq.app">support@inspectiq.app</a>.</p>
      </div>
    </div>
  )
}
