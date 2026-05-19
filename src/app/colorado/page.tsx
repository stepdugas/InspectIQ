import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Shield, FileText, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PublicNav from '@/components/layout/PublicNav'

export const metadata: Metadata = {
  title: 'Colorado Home Inspection Software — AI Reports for CO Inspectors',
  description:
    'InspectIQ is built for Colorado home inspectors. AI handles hail damage, radon, expansive soil, and altitude HVAC issues. $99/mo, 14-day free trial.',
  alternates: { canonical: 'https://www.useinspectiq.com/colorado' },
  openGraph: {
    title: 'Colorado Home Inspection Software — AI Reports for CO Inspectors',
    description:
      'AI-powered inspection software for Colorado. Hail damage, radon, expansive soil, altitude HVAC. 14-day free trial.',
    url: 'https://www.useinspectiq.com/colorado',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Colorado Home Inspection Software — AI Reports for CO Inspectors',
    description:
      'AI-powered inspection software for Colorado. Hail damage, radon, expansive soil, altitude HVAC. 14-day free trial.',
  },
}

const CO_SECTIONS = [
  'Structural (foundations, expansive soil)',
  'Exterior (siding, grading, drainage)',
  'Roofing (hail damage, shingles, flashing)',
  'Plumbing (supply, drainage, water heater)',
  'Electrical (panel, wiring, GFCI)',
  'HVAC (altitude effects, furnace, AC)',
  'Interior (walls, floors, dry climate cracking)',
  'Insulation & Ventilation',
  'Radon Mitigation Systems',
]

export default function ColoradoPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              InterNACHI/ASHI SOP
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              CO Inspector
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Hail, altitude, and expansive soil.<br />
            <span className="text-blue-400">AI handles the report writing.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
            Colorado is #1 in the nation for hail claims. Add altitude effects on HVAC, expansive bentonite clay, and radon levels well above the national average — reports get long fast. InspectIQ&apos;s AI writes your narratives on-site so you keep up with Denver&apos;s booming market.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-base px-8 w-full sm:w-auto">
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sample-report?state=CO">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base px-8 w-full sm:w-auto">
                See a Colorado Sample Report
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card required · Cancel anytime · $99/month after trial</p>
        </div>
      </section>

      {/* CO sections */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <h2 className="text-2xl font-bold text-slate-900">Built for Colorado&apos;s Unique Conditions</h2>
        </div>
        <p className="text-slate-500 mb-8 max-w-2xl">
          Colorado does not require state licensing, but most professional inspectors follow InterNACHI or ASHI Standards of Practice. InspectIQ covers every standard section plus Colorado-specific concerns like hail, radon, and expansive soil.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CO_SECTIONS.map((section) => (
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
          <h2 className="text-2xl font-bold text-slate-900 mb-8">How Colorado inspectors use InspectIQ</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: '1',
                title: 'Create your inspection',
                description: 'Enter the address, pick your template. All standard sections load — structural, roofing, HVAC, radon, and more. Hail damage and expansive soil callouts built in.',
              },
              {
                icon: Zap,
                step: '2',
                title: 'Enter findings, AI writes narratives',
                description: 'Note the hail-damaged shingles, the foundation crack from bentonite clay, the radon mitigation system condition. AI generates professional narratives instantly.',
              },
              {
                icon: Clock,
                step: '3',
                title: 'Deliver the report same-day',
                description: 'Generate a branded PDF with your company logo, certifications, and signature. Email it to your client from the field — even at 7,000 feet.',
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
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Why Colorado inspectors are switching</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'Hail damage, radon, and expansive soil sections built into templates',
            'AI writes narratives for bentonite clay foundation issues in seconds',
            'Altitude effects on HVAC performance documented automatically',
            'Branded PDF reports with your logo, certifications, and signature',
            'Photo annotation — circle the hail impact, arrow the foundation crack, label it',
            'Snow load and ice dam callouts for mountain and front range properties',
            '$99/month flat — unlimited inspections, no per-report fees even in spring rush',
            'Works on your phone — complete reports from the field between jobs',
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
            Colorado&apos;s market is booming. Stop losing evenings to reports.
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            InspectIQ was built for Colorado&apos;s unique conditions. Start your free trial and see how fast you can deliver.
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
          <span>© {new Date().getFullYear()} InspectIQ. Home Inspection Software for Colorado.</span>
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
