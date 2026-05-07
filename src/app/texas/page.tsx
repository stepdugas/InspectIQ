import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Shield, FileText, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PublicNav from '@/components/layout/PublicNav'

export const metadata: Metadata = {
  title: 'TREC 7-6 Home Inspection Software — Built for Texas Inspectors',
  description:
    'InspectIQ is the only home inspection software with the TREC REI 7-6 form built in. AI writes your narratives. Branded PDF reports. $99/mo, 14-day free trial.',
  alternates: { canonical: 'https://www.useinspectiq.com/texas' },
  openGraph: {
    title: 'TREC 7-6 Home Inspection Software — Built for Texas Inspectors',
    description:
      'The only inspection software with TREC REI 7-6 built in. AI narratives, photo annotation, client payments. 14-day free trial.',
    url: 'https://www.useinspectiq.com/texas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TREC 7-6 Home Inspection Software — Built for Texas Inspectors',
    description:
      'The only inspection software with TREC REI 7-6 built in. AI narratives, photo annotation, client payments.',
  },
}

const TREC_SECTIONS = [
  'I. Structural Systems (12 subsections)',
  'II. Electrical Systems (3 subsections)',
  'III. Heating, Ventilation & Air Conditioning (4 subsections)',
  'IV. Plumbing Systems (6 subsections)',
  'V. Appliances (9 subsections)',
  'VI. Optional Systems (7 subsections)',
]

export default function TexasPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
              TX Mandatory Form
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              TREC REI 7-6
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            The only inspection software with<br />
            <span className="text-blue-400">TREC 7-6 built in.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
            Texas requires the REI 7-6 form for every residential inspection. InspectIQ has all 6 sections and 41 subsections pre-loaded — plus AI that writes your deficiency narratives in seconds, not hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-base px-8 w-full sm:w-auto">
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sample-report?state=TX">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base px-8 w-full sm:w-auto">
                See a TREC Sample Report
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card required · Cancel anytime · $99/month after trial</p>
        </div>
      </section>

      {/* TREC 7-6 sections */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900">Complete TREC REI 7-6 Coverage</h2>
        </div>
        <p className="text-slate-500 mb-8 max-w-2xl">
          Every section, every subsection, exactly as TREC requires. Select the TREC 7-6 template when creating an inspection and all mandatory sections are pre-loaded.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TREC_SECTIONS.map((section) => (
            <div key={section} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-sm text-slate-700">{section}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — TX specific */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">How Texas inspectors use InspectIQ</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: '1',
                title: 'Start with TREC 7-6',
                description: 'Create a new inspection, select the TREC REI 7-6 template. All 6 sections and 41 subsections load automatically.',
              },
              {
                icon: Zap,
                step: '2',
                title: 'Enter findings, AI writes narratives',
                description: 'Mark each subsection as Inspected, Not Inspected, Not Present, or Deficient. For deficiencies, enter your notes and AI writes the professional narrative.',
              },
              {
                icon: Clock,
                step: '3',
                title: 'Deliver the report same-day',
                description: 'Generate a branded PDF report with your company logo, license number, and signature. Email it to your client or share via secure link.',
              },
            ].map(({ icon: Icon, step, title, description }) => (
              <div key={step}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">{step}</div>
                  <Icon className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why switch */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Why Texas inspectors are switching</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'TREC REI 7-6 form built in — no manual setup or workarounds',
            'AI writes deficiency narratives from your field notes in seconds',
            'Branded PDF reports with your logo, TREC license number, and signature',
            'Photo annotation — circle the defect, arrow the issue, add text labels',
            'Collect client payments with a single link — money goes to your bank',
            'InterNACHI and ASHI templates also available for ancillary inspections',
            '$99/month flat — unlimited inspections, no per-report fees',
            'Works on your phone — inspect and report from the field',
          ].map((point) => (
            <div key={point} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">{point}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stop fighting your software to produce a TREC 7-6 report.
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            InspectIQ was built for Texas inspectors. Start your free trial, run your first TREC 7-6 inspection, and see the difference.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-base px-8 font-semibold">
              Start 14-Day Free Trial — No Credit Card
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-blue-200 text-xs">
            <span>14-day free trial</span>
            <span className="hidden sm:inline">·</span>
            <span>$99/month after trial</span>
            <span className="hidden sm:inline">·</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
          <span>© {new Date().getFullYear()} InspectIQ. TREC 7-6 Home Inspection Software for Texas.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-slate-600 transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
