import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Shield, FileText, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PublicNav from '@/components/layout/PublicNav'

export const metadata: Metadata = {
  title: 'Florida Home Inspection Software — Wind Mitigation & 4-Point Reports',
  description:
    'InspectIQ is built for Florida home inspectors. AI-powered wind mitigation reports, 4-point inspection forms, and hurricane-ready templates. $99/mo, 14-day free trial.',
  alternates: { canonical: 'https://www.useinspectiq.com/florida' },
  openGraph: {
    title: 'Florida Home Inspection Software — Wind Mitigation & 4-Point Reports',
    description:
      'Wind mitigation and 4-point inspection software built for Florida. AI narratives, photo annotation, client payments. 14-day free trial.',
    url: 'https://www.useinspectiq.com/florida',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Florida Home Inspection Software — Wind Mitigation & 4-Point Reports',
    description:
      'Wind mitigation and 4-point inspection software built for Florida. AI narratives, photo annotation, client payments.',
  },
}

const FLORIDA_SECTIONS = [
  'Wind Mitigation (OIR-B1-1802 form)',
  '4-Point Inspection (Roof, Electrical, Plumbing, HVAC)',
  'Roof Covering & Attachment',
  'Opening Protection (Hurricane Shutters & Impact Glass)',
  'Secondary Water Resistance (SWR)',
  'Electrical Panel & Wiring Type',
]

export default function FloridaPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              Hurricane Zone
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Wind Mitigation & 4-Point
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Wind mitigation reports in minutes,<br />
            <span className="text-blue-400">not hours.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
            Florida inspectors run more wind mitigations and 4-point inspections than anyone in the country. InspectIQ has both forms built in, plus AI that writes your narratives while you are still on-site. Stop losing evenings to report writing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-base px-8 w-full sm:w-auto">
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sample-report?state=FL">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base px-8 w-full sm:w-auto">
                See a Florida Sample Report
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card required · Cancel anytime · $99/month after trial</p>
        </div>
      </section>

      {/* Florida-specific sections */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-orange-500" />
          <h2 className="text-2xl font-bold text-slate-900">Built for Florida's Unique Inspection Demands</h2>
        </div>
        <p className="text-slate-500 mb-8 max-w-2xl">
          Insurance carriers require wind mitigation and 4-point inspections before issuing or renewing policies. InspectIQ has every required section pre-loaded so you never miss a field.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FLORIDA_SECTIONS.map((section) => (
            <div key={section} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-sm text-slate-700">{section}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — FL specific */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">How Florida inspectors use InspectIQ</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: '1',
                title: 'Pick your inspection type',
                description: 'Choose from wind mitigation, 4-point, full residential, or combine multiple types into one job. All Florida-specific forms load automatically.',
              },
              {
                icon: Zap,
                step: '2',
                title: 'AI handles the narratives',
                description: 'Snap photos of roof attachments, electrical panels, and opening protection. Enter your findings and AI generates insurance-ready narratives instantly.',
              },
              {
                icon: Clock,
                step: '3',
                title: 'Deliver before you leave the driveway',
                description: 'Generate a branded PDF with your license number and signature. Email it to the client, agent, and insurance carrier from the field.',
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
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Why Florida inspectors are switching</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'Wind mitigation (OIR-B1-1802) and 4-point forms built in — no manual setup',
            'AI writes insurance-ready narratives from your field notes in seconds',
            'Handle high-volume wind mit season without burning out on reports',
            'Photo annotation — circle roof clips, arrow the FPL panel, label hurricane straps',
            'Branded PDF reports with your Florida license number and company logo',
            'Collect client payments with a single link — money goes straight to your bank',
            '$99/month flat — unlimited inspections, no per-report fees even during storm season',
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
            Florida's busiest inspectors don't waste time on reports.
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            InspectIQ was built for the Florida market. Start your free trial, run a wind mitigation or 4-point, and see how fast you can deliver.
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
          <span>© {new Date().getFullYear()} InspectIQ. Home Inspection Software for Florida.</span>
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
