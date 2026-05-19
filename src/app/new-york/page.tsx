import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Shield, FileText, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PublicNav from '@/components/layout/PublicNav'

export const metadata: Metadata = {
  title: 'New York Home Inspection Software — Older Homes, Diverse Standards, High Demand',
  description:
    'InspectIQ is built for New York home inspectors. AI-powered reports for aging housing stock, varied county standards, and the high-demand NYC metro market. $99/mo, 14-day free trial.',
  alternates: { canonical: 'https://www.useinspectiq.com/new-york' },
  openGraph: {
    title: 'New York Home Inspection Software — Older Homes, Diverse Standards, High Demand',
    description:
      'Inspection software built for New York. AI narratives, older housing stock coverage, photo annotation, client payments. 14-day free trial.',
    url: 'https://www.useinspectiq.com/new-york',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'New York Home Inspection Software — Older Homes, Diverse Standards, High Demand',
    description:
      'Inspection software built for New York. AI narratives, older housing stock coverage, photo annotation, client payments.',
  },
}

const NEW_YORK_SECTIONS = [
  'Older Housing Stock (Pre-War, Colonial, Brownstone Systems)',
  'Electrical (Knob-and-Tube, Federal Pacific Panels, Ungrounded Outlets)',
  'Heating Systems (Oil Tanks, Steam Radiators, Boilers)',
  'Foundation & Basement (Stone, Block, Water Intrusion)',
  'Plumbing (Lead, Galvanized, Cast Iron Drain Lines)',
  'Roof & Exterior (Slate, Asbestos Shingle, Ice Dam Risk)',
]

export default function NewYorkPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Licensed State
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              High-Demand Market
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            100-year-old homes need<br />
            <span className="text-blue-400">modern inspection software.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
            New York inspectors face some of the oldest and most complex housing stock in the country. Knob-and-tube wiring, oil tanks, stone foundations, and inspection standards that vary by county. InspectIQ gives you AI-powered reports that handle it all — so you can keep up with the pace of the New York market.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-base px-8 w-full sm:w-auto">
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sample-report?state=NY">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base px-8 w-full sm:w-auto">
                See a New York Sample Report
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card required · Cancel anytime · $99/month after trial</p>
        </div>
      </section>

      {/* New York-specific sections */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-emerald-500" />
          <h2 className="text-2xl font-bold text-slate-900">Built for New York's Aging Housing Stock</h2>
        </div>
        <p className="text-slate-500 mb-8 max-w-2xl">
          From pre-war brownstones in Brooklyn to colonials in Westchester, New York homes have systems you won't find in newer markets. InspectIQ covers the issues that matter most to New York buyers and their attorneys.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {NEW_YORK_SECTIONS.map((section) => (
            <div key={section} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-sm text-slate-700">{section}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — NY specific */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">How New York inspectors use InspectIQ</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: '1',
                title: 'Start with the right template',
                description: 'Create an inspection and select a residential template with sections for older systems: knob-and-tube, oil tanks, stone foundations, and cast iron drains pre-loaded.',
              },
              {
                icon: Zap,
                step: '2',
                title: 'AI tackles complex deficiencies',
                description: 'Document obsolete wiring, failing boilers, and water intrusion. Enter your findings and AI generates detailed narratives that hold up when attorneys review the report.',
              },
              {
                icon: Clock,
                step: '3',
                title: 'Deliver on New York\u2019s timeline',
                description: 'New York transactions move fast and involve attorneys on both sides. Generate a branded PDF report and deliver it same-day so you never hold up a deal.',
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
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Why New York inspectors are switching</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'Older housing stock sections built in — knob-and-tube, oil tanks, stone foundations, cast iron drains',
            'AI writes complex deficiency narratives that hold up to attorney review',
            'Photo annotation — circle corroded pipes, arrow failed flashing, label obsolete panels',
            'Flexible templates that work across NYC co-ops, suburban colonials, and upstate farmhouses',
            'Branded PDF reports with your New York license number and company logo',
            'Collect client payments with a single link — money goes straight to your bank',
            '$99/month flat — unlimited inspections, no per-report fees even at NYC volume',
            'Works on your phone — complete reports between appointments without going back to the office',
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
            New York doesn't wait. Neither should your reports.
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            InspectIQ was built for the pace and complexity of the New York market. Start your free trial, inspect a home, and deliver a report that earns referrals.
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
          <span>© {new Date().getFullYear()} InspectIQ. Home Inspection Software for New York.</span>
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
