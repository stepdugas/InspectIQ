import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Shield, FileText, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PublicNav from '@/components/layout/PublicNav'

export const metadata: Metadata = {
  title: 'Washington Home Inspection Software — AI Reports for WA Inspectors',
  description:
    'InspectIQ is built for Washington home inspectors. WAC 308-408C compliant. AI handles moisture intrusion, moss, crawl spaces, and mold risk. $99/mo, 14-day free trial.',
  alternates: { canonical: 'https://www.useinspectiq.com/washington' },
  openGraph: {
    title: 'Washington Home Inspection Software — AI Reports for WA Inspectors',
    description:
      'WAC 308-408C compliant inspection software with AI narratives. Moisture, moss, crawl spaces. 14-day free trial.',
    url: 'https://www.useinspectiq.com/washington',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Washington Home Inspection Software — AI Reports for WA Inspectors',
    description:
      'WAC 308-408C compliant inspection software with AI narratives. Moisture, moss, crawl spaces. 14-day free trial.',
  },
}

const WA_SECTIONS = [
  'Structural Components',
  'Exterior (siding, grading, drainage)',
  'Roofing (moss, shingles, flashing)',
  'Plumbing (supply, drainage, water heater)',
  'Electrical (panel, wiring, GFCI)',
  'HVAC (furnace, heat pump, ductwork)',
  'Interior (walls, floors, moisture signs)',
  'Insulation & Ventilation',
  'Crawl Spaces & Moisture Barriers',
]

export default function WashingtonPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
              WAC 308-408C
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              WA Licensed
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Rain finds every weakness.<br />
            <span className="text-blue-400">AI writes the report before you leave.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
            Pacific Northwest moisture makes every inspection a moisture inspection. Moss on roofs, crawl space vapor barriers, mold risk — Washington reports are detailed by necessity. InspectIQ&apos;s AI writes your narratives on-site so you stop losing evenings.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-base px-8 w-full sm:w-auto">
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sample-report?state=WA">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base px-8 w-full sm:w-auto">
                See a Washington Sample Report
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card required · Cancel anytime · $99/month after trial</p>
        </div>
      </section>

      {/* WA sections */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-green-500" />
          <h2 className="text-2xl font-bold text-slate-900">Full WAC 308-408C Coverage</h2>
        </div>
        <p className="text-slate-500 mb-8 max-w-2xl">
          Washington inspectors are licensed by the Department of Licensing under WAC 308-408C. Every required section is pre-loaded — with extra attention to Pacific Northwest moisture and crawl space conditions.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WA_SECTIONS.map((section) => (
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
          <h2 className="text-2xl font-bold text-slate-900 mb-8">How Washington inspectors use InspectIQ</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: '1',
                title: 'Create your inspection',
                description: 'Enter the address, pick your template. All WAC 308-408C sections load — structural, roofing, HVAC, crawl space moisture barriers, and more.',
              },
              {
                icon: Zap,
                step: '2',
                title: 'Enter findings, AI writes narratives',
                description: 'Note the moss on the roof, the crawl space vapor barrier condition, the moisture intrusion at the window. AI writes professional narratives that explain each issue clearly.',
              },
              {
                icon: Clock,
                step: '3',
                title: 'Deliver the report same-day',
                description: 'Generate a branded PDF with your company logo, WA license number, and signature. Email it to your client before the Seattle rain starts again.',
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
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Why Washington inspectors are switching</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'WAC 308-408C sections pre-loaded — no manual template building',
            'AI writes narratives for moisture intrusion, moss, mold risk, and vapor barriers',
            'Crawl space moisture barrier and drainage sections built into templates',
            'Branded PDF reports with your logo, WA license number, and signature',
            'Photo annotation — circle the moss growth, arrow the moisture stain, label it',
            'Seismic retrofitting and older home callouts for Seattle/Tacoma properties',
            '$99/month flat — unlimited inspections, no per-report fees',
            'Works on your phone — complete reports from the field between rainy jobs',
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
            The rain won&apos;t stop. Your report backlog should.
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            InspectIQ was built for the Pacific Northwest. Start your free trial and deliver your first AI-powered report today.
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
          <span>© {new Date().getFullYear()} InspectIQ. Home Inspection Software for Washington.</span>
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
