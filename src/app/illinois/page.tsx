import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Shield, FileText, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PublicNav from '@/components/layout/PublicNav'

export const metadata: Metadata = {
  title: 'Illinois Home Inspection Software — Radon, Foundations & Chicago Metro',
  description:
    'InspectIQ is built for Illinois home inspectors. AI-powered reports covering radon testing, freeze-thaw foundation damage, and high-volume Chicago metro inspections. $99/mo, 14-day free trial.',
  alternates: { canonical: 'https://www.useinspectiq.com/illinois' },
  openGraph: {
    title: 'Illinois Home Inspection Software — Radon, Foundations & Chicago Metro',
    description:
      'Inspection software built for Illinois. Radon, freeze-thaw foundations, AI narratives, photo annotation. 14-day free trial.',
    url: 'https://www.useinspectiq.com/illinois',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Illinois Home Inspection Software — Radon, Foundations & Chicago Metro',
    description:
      'Inspection software built for Illinois. Radon, freeze-thaw foundations, AI narratives, photo annotation.',
  },
}

const ILLINOIS_SECTIONS = [
  'Radon Testing & Mitigation Systems',
  'Foundation & Basement (Freeze-Thaw Cracking, Water Intrusion)',
  'Heating Systems (Furnace Age, Heat Exchanger Condition)',
  'Electrical (Fuse Boxes, Aluminum Wiring in Older Stock)',
  'Roof & Attic (Ice Dam Risk, Insulation Levels)',
  'Plumbing (Lead Service Lines, Galvanized Supply Pipes)',
]

export default function IllinoisPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Radon Zone 1
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Licensed State
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Radon, foundations, and Chicago winters.<br />
            <span className="text-blue-400">Your software should keep up.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
            Illinois inspectors deal with radon in nearly every basement, freeze-thaw foundation cracks, aging furnaces, and a Chicago metro market that demands fast turnaround. InspectIQ handles all of it with AI-powered narratives so you can deliver reports the same day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-base px-8 w-full sm:w-auto">
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sample-report?state=IL">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base px-8 w-full sm:w-auto">
                See an Illinois Sample Report
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card required · Cancel anytime · $99/month after trial</p>
        </div>
      </section>

      {/* Illinois-specific sections */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-purple-500" />
          <h2 className="text-2xl font-bold text-slate-900">Built for Illinois Inspection Challenges</h2>
        </div>
        <p className="text-slate-500 mb-8 max-w-2xl">
          Illinois is an EPA Radon Zone 1 state, and harsh winters punish foundations, roofs, and heating systems. InspectIQ includes sections for every issue Illinois buyers care about most.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ILLINOIS_SECTIONS.map((section) => (
            <div key={section} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-sm text-slate-700">{section}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — IL specific */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">How Illinois inspectors use InspectIQ</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: '1',
                title: 'Start with the right template',
                description: 'Create an inspection and select a residential template with Illinois-relevant sections for radon, foundation assessment, heating systems, and winterization pre-loaded.',
              },
              {
                icon: Zap,
                step: '2',
                title: 'AI writes your narratives on-site',
                description: 'Document foundation cracks, radon levels, furnace conditions, and ice dam evidence. Enter your findings and AI generates detailed, professional narratives instantly.',
              },
              {
                icon: Clock,
                step: '3',
                title: 'Deliver reports on Chicago time',
                description: 'The Chicago metro market moves fast. Generate branded PDF reports with your Illinois license number and deliver them before competing inspectors finish writing theirs.',
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
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Why Illinois inspectors are switching</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'Radon testing and mitigation system documentation built into your workflow',
            'AI writes freeze-thaw foundation narratives from your field notes in seconds',
            'Cover aging housing stock issues: fuse boxes, galvanized pipe, lead service lines',
            'Photo annotation — circle cracks, arrow moisture intrusion, label radon mitigation components',
            'Branded PDF reports with your Illinois license number and company logo',
            'Collect client payments with a single link — money goes straight to your bank',
            '$99/month flat — unlimited inspections, no per-report fees even during spring rush',
            'Works on your phone — complete reports between back-to-back Chicago appointments',
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
            Stop spending your evenings writing reports.
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            InspectIQ was built for the demands of Illinois inspections. Start your free trial, run your first inspection, and reclaim your nights.
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
          <span>© {new Date().getFullYear()} InspectIQ. Home Inspection Software for Illinois.</span>
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
