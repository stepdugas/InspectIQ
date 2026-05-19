import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Shield, FileText, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PublicNav from '@/components/layout/PublicNav'

export const metadata: Metadata = {
  title: 'Arizona Home Inspection Software — AI Reports for AZ Inspectors',
  description:
    'InspectIQ is built for Arizona home inspectors. BTR certified. AI handles pool/spa, flat roofs, HVAC, and stucco narratives. $99/mo, 14-day free trial.',
  alternates: { canonical: 'https://www.useinspectiq.com/arizona' },
  openGraph: {
    title: 'Arizona Home Inspection Software — AI Reports for AZ Inspectors',
    description:
      'BTR certified inspection software with AI narratives. Pool/spa, flat roofs, desert HVAC. 14-day free trial.',
    url: 'https://www.useinspectiq.com/arizona',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arizona Home Inspection Software — AI Reports for AZ Inspectors',
    description:
      'BTR certified inspection software with AI narratives. Pool/spa, flat roofs, desert HVAC. 14-day free trial.',
  },
}

const AZ_SECTIONS = [
  'Structural Components',
  'Exterior (stucco, grading, drainage)',
  'Roofing (tile, flat, foam, shingle)',
  'Plumbing (supply, drainage, water heater)',
  'Electrical (panel, wiring, GFCI)',
  'HVAC (AC units, heat pump, evap cooler)',
  'Interior (walls, floors, moisture signs)',
  'Insulation & Ventilation',
  'Pool & Spa Systems',
]

export default function ArizonaPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              BTR Certified
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              ASZPP Standards
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            115°F puts everything to the test.<br />
            <span className="text-blue-400">AI writes the report while you drive to the next one.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
            Arizona&apos;s desert heat destroys roofs, overworks HVAC systems, and cracks stucco. Add pool inspections to every other job and reports pile up fast. InspectIQ&apos;s AI writes your narratives on-site so you can keep up with Phoenix metro&apos;s demand.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-base px-8 w-full sm:w-auto">
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sample-report?state=AZ">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base px-8 w-full sm:w-auto">
                See an Arizona Sample Report
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card required · Cancel anytime · $99/month after trial</p>
        </div>
      </section>

      {/* AZ sections */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-orange-500" />
          <h2 className="text-2xl font-bold text-slate-900">Built for Arizona&apos;s Desert Conditions</h2>
        </div>
        <p className="text-slate-500 mb-8 max-w-2xl">
          Arizona inspectors are certified by the Board of Technical Registration (BTR). InspectIQ covers every ASZPP section — including pool/spa systems that most other inspection software treats as an afterthought.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AZ_SECTIONS.map((section) => (
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
          <h2 className="text-2xl font-bold text-slate-900 mb-8">How Arizona inspectors use InspectIQ</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: '1',
                title: 'Create your inspection',
                description: 'Enter the address, pick your template. All ASZPP sections load — structural, roofing, HVAC, pool/spa, and more. Tile roof and flat roof templates included.',
              },
              {
                icon: Zap,
                step: '2',
                title: 'Enter findings, AI writes narratives',
                description: 'Note the cracked stucco, the aging AC compressor, the pool equipment condition. AI writes professional narratives explaining each deficiency and recommended action.',
              },
              {
                icon: Clock,
                step: '3',
                title: 'Deliver the report same-day',
                description: 'Generate a branded PDF with your company logo, BTR certification number, and signature. Email it to your client before your next appointment.',
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
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Why Arizona inspectors are switching</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'Pool and spa inspection sections built in — not bolted on as an afterthought',
            'AI writes narratives for stucco cracking, flat roof blistering, HVAC strain',
            'Tile roof, foam roof, and flat roof templates — Arizona-specific coverage',
            'Branded PDF reports with your logo, BTR certification, and signature',
            'Photo annotation — circle the expansion crack, arrow the pool equipment, label it',
            'Monsoon water intrusion and soil expansion callouts built into templates',
            '$99/month flat — unlimited inspections, no per-report fees even in peak season',
            'Works on your phone — complete reports from the field in 115°F heat',
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
            Stop losing your evenings to reports in the desert heat.
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            InspectIQ was built for Arizona inspectors. Start your free trial and see how fast you can deliver a professional report.
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
          <span>© {new Date().getFullYear()} InspectIQ. Home Inspection Software for Arizona.</span>
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
