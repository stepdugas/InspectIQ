import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCityBySlug, getAllSlugs } from '@/lib/cities'
import { CheckCircle2, ArrowRight, FileText, Cpu, Share2, Camera, CreditCard, Calendar } from 'lucide-react'

// Pre-build all 50 city pages at deploy time
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

// Unique meta per city
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const city = getCityBySlug(slug)
  if (!city) return {}

  // Strip "| InspectIQ" suffix — the layout template appends it automatically
  const pageTitle = city.metaTitle.replace(/\s*\|\s*InspectIQ$/, '')

  return {
    title: pageTitle,
    description: city.metaDescription,
    alternates: {
      canonical: `https://www.useinspectiq.com/locations/${slug}`,
    },
    openGraph: {
      title: city.metaTitle,
      description: city.metaDescription,
      url: `https://www.useinspectiq.com/locations/${slug}`,
      type: 'website',
      siteName: 'InspectIQ',
    },
    twitter: {
      card: 'summary_large_image',
      title: city.metaTitle,
      description: city.metaDescription,
    },
  }
}

const features = [
  {
    icon: Cpu,
    title: 'AI Narrative Generation',
    description:
      'One click turns your field notes into professional, client-ready written findings.',
  },
  {
    icon: FileText,
    title: 'Branded PDF Reports',
    description:
      'Polished, logo-branded PDF reports that reflect your professionalism — not generic templates.',
  },
  {
    icon: Share2,
    title: 'Instant Client Share Links',
    description:
      'Send clients a secure link to view their report online — no login required on their end.',
  },
  {
    icon: Camera,
    title: 'Photo Annotation',
    description:
      'Mark up photos with arrows, boxes, and text directly in the app — no desktop software needed.',
  },
  {
    icon: CreditCard,
    title: 'Client Payment Collection',
    description:
      'Set your inspection fee and send clients a payment link. Money lands in your account automatically.',
  },
  {
    icon: Calendar,
    title: 'Built-In Scheduling',
    description:
      'Calendar view for all your upcoming jobs. Schedule inspections and see your week at a glance.',
  },
]

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const city = getCityBySlug(slug)
  if (!city) notFound()

  const { city: cityName, state, stateAbbr, bodyParagraph } = city

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-white tracking-tight">
            Inspect<span className="text-purple-400">IQ</span>
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <p className="text-purple-400 text-sm font-medium uppercase tracking-widest mb-4">
          {cityName}, {stateAbbr}
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
          AI Home Inspection Software
          <br />
          <span className="text-purple-400">
            in {cityName}, {state}
          </span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
          {bodyParagraph}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Start Your Free 14-Day Trial <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            See How It Works
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why InspectIQ */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Why {cityName} Home Inspectors Choose InspectIQ
          </h2>
          <ul className="space-y-3">
            {[
              `Complete inspection reports in a fraction of the time of legacy software`,
              `InterNACHI standards pre-loaded — no manual setup required`,
              `AI narratives write professional findings from your field notes automatically`,
              `Annotate photos with arrows, boxes & text — right in the app`,
              `Collect client payments with a single link — no invoicing hassle`,
              `Built-in scheduling calendar to manage your jobs`,
              `Custom inspection templates for your market and property types`,
              `Branded PDF reports clients can view, download, or share`,
              `Secure client share links — no client login required`,
              `$99/month flat — no per-report fees, no contracts`,
            ].map((point) => (
              <li key={point} className="flex items-start gap-3 text-slate-300 text-sm">
                <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-800/40 rounded-2xl px-8 py-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to upgrade your inspection reports?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join home inspectors in {cityName} and across the country using InspectIQ to
            close more inspections with less time spent on report writing.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Start Free — No Credit Card Required <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <span>
            © {new Date().getFullYear()} InspectIQ. AI Home Inspection Software for{' '}
            {cityName}, {state}.
          </span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms
            </Link>
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
