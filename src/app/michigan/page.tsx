import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Shield, FileText, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PublicNav from '@/components/layout/PublicNav'

export const metadata: Metadata = {
  title: 'Michigan Home Inspection Software — AI Reports for MI Inspectors',
  description:
    'InspectIQ is built for Michigan home inspectors. AI handles ice dams, basements, galvanized plumbing, and aging electrical. $99/mo, 14-day free trial.',
  alternates: { canonical: 'https://www.useinspectiq.com/michigan' },
  openGraph: {
    title: 'Michigan Home Inspection Software — AI Reports for MI Inspectors',
    description:
      'AI-powered inspection software for Michigan. Ice dams, basements, older housing stock. 14-day free trial.',
    url: 'https://www.useinspectiq.com/michigan',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Michigan Home Inspection Software — AI Reports for MI Inspectors',
    description:
      'AI-powered inspection software for Michigan. Ice dams, basements, older housing stock. 14-day free trial.',
  },
}

const MI_SECTIONS = [
  'Structural Components',
  'Exterior (siding, grading, drainage)',
  'Roofing (ice dams, shingles, flashing)',
  'Plumbing (galvanized, supply, drainage)',
  'Electrical (panel, wiring type, GFCI)',
  'HVAC (furnace, boiler, ductwork)',
  'Interior (basement, walls, floors)',
  'Insulation & Ventilation',
  'Fireplaces & Chimneys',
  'Garage (door, opener, fire separation)',
]

export default function MichiganPage() {
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
              MI Inspector
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Michigan winters test every house.<br />
            <span className="text-blue-400">AI writes the report so you don&apos;t have to.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
            Ice dams, frozen pipes, aging basements, galvanized plumbing, old electrical panels — Michigan&apos;s housing stock creates detailed reports. InspectIQ&apos;s AI writes your narratives on-site so you stop losing evenings to paperwork.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-base px-8 w-full sm:w-auto">
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sample-report?state=MI">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base px-8 w-full sm:w-auto">
                See a Michigan Sample Report
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card required · Cancel anytime · $99/month after trial</p>
        </div>
      </section>

      {/* MI sections */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <h2 className="text-2xl font-bold text-slate-900">Built for Michigan&apos;s Housing Stock</h2>
        </div>
        <p className="text-slate-500 mb-8 max-w-2xl">
          Michigan does not require state licensing, but professional inspectors follow InterNACHI or ASHI Standards of Practice. InspectIQ covers every standard section plus Michigan-specific concerns like ice damage, basements, and aging systems.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MI_SECTIONS.map((section) => (
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
          <h2 className="text-2xl font-bold text-slate-900 mb-8">How Michigan inspectors use InspectIQ</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: '1',
                title: 'Create your inspection',
                description: 'Enter the address, pick your template. All standard sections load — structural, roofing, HVAC, basement, electrical, and more.',
              },
              {
                icon: Zap,
                step: '2',
                title: 'Enter findings, AI writes narratives',
                description: 'Note the ice dam damage, the galvanized supply lines, the aging furnace, the basement moisture. AI writes professional narratives for each deficiency.',
              },
              {
                icon: Clock,
                step: '3',
                title: 'Deliver the report same-day',
                description: 'Generate a branded PDF with your company logo, certifications, and signature. Email it to your client before your next appointment.',
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
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Why Michigan inspectors are switching</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'Ice dam, frozen pipe, and winter damage callouts built into templates',
            'AI writes narratives for galvanized plumbing, old panels, and aging furnaces',
            'Basement moisture and foundation sections — nearly every MI home has a basement',
            'Branded PDF reports with your logo, certifications, and signature',
            'Photo annotation — circle the ice dam damage, arrow the rusted pipe, label it',
            'Handles older Detroit/Grand Rapids homes and new suburban construction',
            '$99/month flat — unlimited inspections, no per-report fees',
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
            Michigan homes are tough. Report writing shouldn&apos;t be.
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            InspectIQ was built for Michigan&apos;s unique conditions. Start your free trial and deliver your first AI-powered report today.
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
          <span>© {new Date().getFullYear()} InspectIQ. Home Inspection Software for Michigan.</span>
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
