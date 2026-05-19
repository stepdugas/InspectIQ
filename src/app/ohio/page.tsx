import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Shield, FileText, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PublicNav from '@/components/layout/PublicNav'

export const metadata: Metadata = {
  title: 'Ohio Home Inspection Software — AI Reports for OH Inspectors',
  description:
    'InspectIQ is built for Ohio home inspectors. AI writes your narratives in seconds. Ice dams, radon, basements — all covered. $99/mo, 14-day free trial.',
  alternates: { canonical: 'https://www.useinspectiq.com/ohio' },
  openGraph: {
    title: 'Ohio Home Inspection Software — AI Reports for OH Inspectors',
    description:
      'AI-powered inspection software built for Ohio. Handles ice dams, radon, basements, aging furnaces. 14-day free trial.',
    url: 'https://www.useinspectiq.com/ohio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ohio Home Inspection Software — AI Reports for OH Inspectors',
    description:
      'AI-powered inspection software built for Ohio. Handles ice dams, radon, basements, aging furnaces. 14-day free trial.',
  },
}

const OHIO_SECTIONS = [
  'Structural Components',
  'Exterior (siding, grading, drainage)',
  'Roofing (shingles, ice dam risk areas)',
  'Plumbing (galvanized pipe, well/septic)',
  'Electrical (panel, wiring type, GFCI)',
  'HVAC (furnace age, heat exchangers)',
  'Interior (basement moisture, walls, floors)',
  'Insulation & Ventilation',
  'Fireplaces & Chimneys',
]

export default function OhioPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
              OAC 1301:11-1
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              OH Licensed
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Ohio winters are hard on houses.<br />
            <span className="text-blue-400">Let AI handle the reports.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
            Ice dams, aging furnaces, wet basements, radon — Ohio inspectors deal with it all. InspectIQ has every OAC 1301:11-1 section pre-loaded, plus AI that writes your deficiency narratives in seconds so you stop losing evenings to report writing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-base px-8 w-full sm:w-auto">
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sample-report?state=OH">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base px-8 w-full sm:w-auto">
                See an Ohio Sample Report
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card required · Cancel anytime · $99/month after trial</p>
        </div>
      </section>

      {/* Ohio sections */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900">Full OAC 1301:11-1 Coverage</h2>
        </div>
        <p className="text-slate-500 mb-8 max-w-2xl">
          Ohio inspectors are licensed by the Division of Real Estate and follow OAC 1301:11-1 Standards of Practice. Every required section is pre-loaded — just start inspecting.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OHIO_SECTIONS.map((section) => (
            <div key={section} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-sm text-slate-700">{section}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">How Ohio inspectors use InspectIQ</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: '1',
                title: 'Create your inspection',
                description: 'Enter the address, pick your template. All OAC sections load automatically — structural, roofing, HVAC, plumbing, electrical, and more.',
              },
              {
                icon: Zap,
                step: '2',
                title: 'Enter findings, AI writes narratives',
                description: 'Mark conditions, enter your notes on ice dam damage, furnace age, basement moisture, radon mitigation systems. AI generates professional narratives instantly.',
              },
              {
                icon: Clock,
                step: '3',
                title: 'Deliver the report same-day',
                description: 'Generate a branded PDF with your company logo, OH license number, and signature. Email it to your client before you leave the driveway.',
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
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Why Ohio inspectors are switching</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'OAC 1301:11-1 sections pre-loaded — no manual template building',
            'AI writes deficiency narratives from your field notes in seconds',
            'Ice dam, radon, and basement moisture callouts built into templates',
            'Branded PDF reports with your logo, OH license number, and signature',
            'Photo annotation — circle the defect, arrow the issue, label it',
            'Collect client payments with a single link — money goes to your bank',
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
            Stop spending 4 hours on every report.
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            InspectIQ was built for inspectors like you. Start your free trial, run your first inspection, and see the difference.
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
          <span>© {new Date().getFullYear()} InspectIQ. Home Inspection Software for Ohio.</span>
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
