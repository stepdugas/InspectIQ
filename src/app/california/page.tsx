import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Shield, FileText, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PublicNav from '@/components/layout/PublicNav'

export const metadata: Metadata = {
  title: 'California Home Inspection Software — Seismic, NHD & High-Value Properties',
  description:
    'InspectIQ is built for California home inspectors. AI-powered reports covering seismic concerns, natural hazard disclosures, and diverse housing stock. $99/mo, 14-day free trial.',
  alternates: { canonical: 'https://www.useinspectiq.com/california' },
  openGraph: {
    title: 'California Home Inspection Software — Seismic, NHD & High-Value Properties',
    description:
      'Inspection software built for California. AI narratives, natural hazard coverage, photo annotation, client payments. 14-day free trial.',
    url: 'https://www.useinspectiq.com/california',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'California Home Inspection Software — Seismic, NHD & High-Value Properties',
    description:
      'Inspection software built for California. AI narratives, natural hazard coverage, photo annotation, client payments.',
  },
}

const CALIFORNIA_SECTIONS = [
  'Seismic & Earthquake Safety (Foundation Bolting, Cripple Walls)',
  'Natural Hazard Disclosure (NHD) Zones',
  'Wildfire Risk & Defensible Space',
  'Structural Systems (Including Hillside & Retaining Walls)',
  'Electrical (Knob-and-Tube, Aluminum Wiring in Older Homes)',
  'Plumbing (Polybutylene, Galvanized Pipe Identification)',
]

export default function CaliforniaPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              Seismic Zone
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              NHD Required
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Inspection software that handles<br />
            <span className="text-blue-400">California's complexity.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
            California properties demand more from inspectors than anywhere else. Seismic safety, natural hazard disclosures, wildfire zones, and million-dollar homes with aging foundations. InspectIQ gives you AI-powered reports that match the complexity of the market you serve.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-base px-8 w-full sm:w-auto">
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sample-report?state=CA">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base px-8 w-full sm:w-auto">
                See a California Sample Report
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card required · Cancel anytime · $99/month after trial</p>
        </div>
      </section>

      {/* California-specific sections */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-yellow-500" />
          <h2 className="text-2xl font-bold text-slate-900">Built for California's Unique Inspection Landscape</h2>
        </div>
        <p className="text-slate-500 mb-8 max-w-2xl">
          From earthquake retrofits in the Bay Area to wildfire zones in Southern California, InspectIQ covers the issues that matter most to California buyers, sellers, and their agents.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CALIFORNIA_SECTIONS.map((section) => (
            <div key={section} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-sm text-slate-700">{section}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — CA specific */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">How California inspectors use InspectIQ</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: '1',
                title: 'Select your template',
                description: 'Choose a full residential template with California-specific sections for seismic safety, NHD zones, and wildfire risk pre-loaded alongside standard systems.',
              },
              {
                icon: Zap,
                step: '2',
                title: 'AI writes detailed narratives',
                description: 'Document cripple walls, foundation bolting, older wiring, and fire-prone landscaping. AI generates thorough, professional narratives that match the detail high-value California transactions demand.',
              },
              {
                icon: Clock,
                step: '3',
                title: 'Deliver a report clients trust',
                description: 'Generate a branded PDF with your company logo and license number. California agents and buyers expect polished reports — InspectIQ delivers them same-day.',
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
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Why California inspectors are switching</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'Seismic and earthquake safety sections built in — foundation bolting, cripple walls, soft stories',
            'AI writes narratives for complex deficiencies in seconds, not hours',
            'Photo annotation — circle cracks, arrow failed seals, label retrofit hardware',
            'Templates cover diverse housing stock: Victorians, mid-century, new construction, hillside homes',
            'Branded PDF reports that meet the expectations of high-value California transactions',
            'Collect client payments with a single link — money goes straight to your bank',
            '$99/month flat — unlimited inspections, no per-report fees even at California volume',
            'Works on your phone — inspect and report from the field between back-to-back appointments',
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
            Your reports should match the quality of the homes you inspect.
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            InspectIQ was built for the California market. Start your free trial, run your first inspection, and deliver a report that impresses agents and clients.
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
          <span>© {new Date().getFullYear()} InspectIQ. Home Inspection Software for California.</span>
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
