import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, XCircle, ArrowRight, Building2 } from 'lucide-react'
import PublicNav from '@/components/layout/PublicNav'

/* ------------------------------------------------------------------ */
/*  Competitor data                                                    */
/* ------------------------------------------------------------------ */

type Feature = {
  name: string
  inspectiq: boolean | string
  competitor: boolean | string
}

type CompetitorData = {
  name: string
  slug: string
  tagline: string
  price: string
  description: string
  features: Feature[]
  differentiators: { title: string; body: string }[]
}

const competitors: Record<string, CompetitorData> = {
  spectora: {
    name: 'Spectora',
    slug: 'spectora',
    tagline: 'InspectIQ vs Spectora',
    price: '$79-199/mo',
    description:
      'Spectora is a popular report writing tool with scheduling and a mobile app. It helps newer inspectors write reports faster, but it still requires you to do the work. InspectIQ replaces manual tasks with 13 AI agents that do the work for you.',
    features: [
      { name: 'AI Report Writer', inspectiq: true, competitor: false },
      { name: 'Report Writing Tool', inspectiq: true, competitor: true },
      { name: 'Scheduling & Booking', inspectiq: true, competitor: true },
      { name: 'Mobile App', inspectiq: 'Web-based (works on any device)', competitor: true },
      { name: '13 Autonomous AI Agents', inspectiq: true, competitor: false },
      { name: 'Auto Follow-Up Sequences', inspectiq: true, competitor: false },
      { name: 'Google Review Requests', inspectiq: true, competitor: false },
      { name: 'After-Hours Email Agent', inspectiq: true, competitor: false },
      { name: 'Lead Qualification Agent', inspectiq: true, competitor: false },
      { name: 'Marketing Content Agent', inspectiq: true, competitor: false },
      { name: 'Repair Summary Generation', inspectiq: true, competitor: false },
      { name: 'Compliance Tracking', inspectiq: true, competitor: false },
      { name: 'Business Intelligence', inspectiq: true, competitor: false },
      { name: 'Realtor Nurture Agent', inspectiq: true, competitor: false },
      { name: 'Flat Pricing', inspectiq: '$99/mo', competitor: '$79-199/mo' },
    ],
    differentiators: [
      {
        title: 'AI agents, not AI suggestions',
        body: 'Spectora may offer text suggestions, but InspectIQ deploys 13 autonomous agents that write full reports, send follow-ups, request reviews, qualify leads, and handle after-hours emails without you touching a button.',
      },
      {
        title: 'One price, everything included',
        body: 'Spectora charges $79-199/mo depending on tier, and many features are locked behind higher plans. InspectIQ is $99/mo flat for all 13 agents, unlimited inspections, and unlimited reports.',
      },
      {
        title: 'Built for solo inspectors who want to grow',
        body: 'Spectora is a tool that helps you work faster. InspectIQ is an AI workforce that handles admin work so you can focus on inspections and growing your business.',
      },
    ],
  },
  homegauge: {
    name: 'HomeGauge',
    slug: 'homegauge',
    tagline: 'InspectIQ vs HomeGauge',
    price: '$99-199/mo',
    description:
      'HomeGauge is an established report writing platform with templates and a companion app. It has a large user base, but it relies on you to do all the follow-up, marketing, and client communication manually. InspectIQ automates all of that with 13 AI agents.',
    features: [
      { name: 'AI Report Writer', inspectiq: true, competitor: false },
      { name: 'Report Templates', inspectiq: true, competitor: true },
      { name: 'Companion/Mobile App', inspectiq: 'Web-based (works on any device)', competitor: true },
      { name: '13 Autonomous AI Agents', inspectiq: true, competitor: false },
      { name: 'Auto Follow-Up Sequences', inspectiq: true, competitor: false },
      { name: 'Google Review Requests', inspectiq: true, competitor: false },
      { name: 'Automated Marketing', inspectiq: true, competitor: false },
      { name: 'After-Hours Email Agent', inspectiq: true, competitor: false },
      { name: 'Lead Qualification Agent', inspectiq: true, competitor: false },
      { name: 'Scheduling & Booking', inspectiq: true, competitor: 'Limited' },
      { name: 'Repair Summary Generation', inspectiq: true, competitor: false },
      { name: 'Compliance Tracking', inspectiq: true, competitor: false },
      { name: 'Business Intelligence', inspectiq: true, competitor: false },
      { name: 'Realtor Nurture Agent', inspectiq: true, competitor: false },
      { name: 'Flat Pricing', inspectiq: '$99/mo', competitor: '$99-199/mo' },
    ],
    differentiators: [
      {
        title: 'Templates vs. an AI workforce',
        body: 'HomeGauge gives you report templates to fill in. InspectIQ gives you an AI agent that writes the entire report from your field notes. That is a fundamentally different approach to saving time.',
      },
      {
        title: 'Zero manual follow-up',
        body: 'With HomeGauge, you manually email clients, chase reviews, and nurture realtors. InspectIQ agents handle all of this automatically: follow-up sequences, review requests, realtor relationship building, and after-hours email responses.',
      },
      {
        title: 'Modern platform, one flat price',
        body: 'HomeGauge has been around for years, but its pricing tiers lock features behind higher plans. InspectIQ is $99/mo flat for everything, including all 13 AI agents and unlimited usage.',
      },
    ],
  },
  isn: {
    name: 'ISN (Inspection Support Network)',
    slug: 'isn',
    tagline: 'InspectIQ vs ISN',
    price: '$49-99/mo',
    description:
      'ISN is a business management platform focused on scheduling, invoicing, and client communication. It is often used alongside a separate report writing tool. InspectIQ replaces both ISN and your report software with a single AI-powered platform.',
    features: [
      { name: 'AI Report Writer', inspectiq: true, competitor: false },
      { name: 'Report Writing', inspectiq: true, competitor: false },
      { name: 'Scheduling & Booking', inspectiq: true, competitor: true },
      { name: 'Invoicing', inspectiq: true, competitor: true },
      { name: 'Client Communication', inspectiq: 'AI-automated', competitor: 'Manual' },
      { name: '13 Autonomous AI Agents', inspectiq: true, competitor: false },
      { name: 'Auto Follow-Up Sequences', inspectiq: true, competitor: false },
      { name: 'Google Review Requests', inspectiq: true, competitor: false },
      { name: 'After-Hours Email Agent', inspectiq: true, competitor: false },
      { name: 'Lead Qualification Agent', inspectiq: true, competitor: false },
      { name: 'Marketing Content Agent', inspectiq: true, competitor: false },
      { name: 'Repair Summary Generation', inspectiq: true, competitor: false },
      { name: 'Compliance Tracking', inspectiq: true, competitor: false },
      { name: 'Business Intelligence', inspectiq: true, competitor: false },
      { name: 'Flat Pricing', inspectiq: '$99/mo', competitor: '$49-99/mo' },
    ],
    differentiators: [
      {
        title: 'One platform instead of two',
        body: 'ISN does not write reports. Most ISN users pay for a separate report tool (Spectora, HomeGauge, etc.) on top of their ISN subscription. InspectIQ replaces both with a single platform that handles reporting, scheduling, invoicing, and 13 AI agents.',
      },
      {
        title: 'AI automation vs. manual operations',
        body: 'ISN organizes your business operations, but you still do the work: sending emails, following up with clients, requesting reviews. InspectIQ agents handle all of that autonomously.',
      },
      {
        title: 'Lower total cost',
        body: 'ISN at $49-99/mo plus a report tool at $79-199/mo means you could be paying $128-298/mo for less functionality. InspectIQ is $99/mo flat for everything.',
      },
    ],
  },
}

const VALID_SLUGS = ['spectora', 'homegauge', 'isn'] as const

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return VALID_SLUGS.map((competitor) => ({ competitor }))
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>
}): Promise<Metadata> {
  const { competitor: slug } = await params
  const data = competitors[slug]
  if (!data) return { title: 'Comparison Not Found' }

  const title = `InspectIQ vs ${data.name} — Best ${data.name} Alternative for Home Inspectors`
  const description = `Compare InspectIQ and ${data.name} side by side. See why home inspectors switch from ${data.name} to InspectIQ's 13 AI agents for report writing, follow-ups, scheduling, and more. $99/mo flat.`
  const url = `https://www.useinspectiq.com/vs/${data.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'InspectIQ',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

/* ------------------------------------------------------------------ */
/*  Feature cell renderer                                              */
/* ------------------------------------------------------------------ */

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true)
    return <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" aria-label="Included" />
  if (value === false)
    return <XCircle className="h-5 w-5 text-slate-300 mx-auto" aria-label="Not included" />
  return <span className="text-sm text-slate-600 text-center block">{value}</span>
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function CompetitorPage({
  params,
}: {
  params: Promise<{ competitor: string }>
}) {
  const { competitor: slug } = await params
  const data = competitors[slug]

  if (!data) {
    const { notFound } = await import('next/navigation')
    notFound()
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.useinspectiq.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `InspectIQ vs ${data.name}`,
        item: `https://www.useinspectiq.com/vs/${data.slug}`,
      },
    ],
  }

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PublicNav />

      {/* Hero */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-3">
            Comparison
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            {data.tagline}
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            {data.description}
          </p>
          <p className="text-slate-800 font-semibold text-xl">
            They help you work faster. InspectIQ does the work for you.
          </p>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">
          Feature Comparison
        </h2>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 w-1/2">Feature</th>
                <th className="py-4 px-6 text-sm font-semibold text-blue-600 text-center w-1/4">
                  InspectIQ
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 text-center w-1/4">
                  {data.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.features.map((feature, i) => (
                <tr
                  key={feature.name}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                >
                  <td className="py-3.5 px-6 text-sm text-slate-700 font-medium">
                    {feature.name}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <FeatureCell value={feature.inspectiq} />
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <FeatureCell value={feature.competitor} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {data.features.map((feature) => (
            <div
              key={feature.name}
              className="rounded-xl border border-slate-200 p-4"
            >
              <p className="text-sm font-medium text-slate-900 mb-3">{feature.name}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs text-blue-600 font-semibold mb-1">InspectIQ</p>
                  <FeatureCell value={feature.inspectiq} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 font-semibold mb-1">{data.name}</p>
                  <FeatureCell value={feature.competitor} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">
            Why Inspectors Switch from {data.name} to InspectIQ
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {data.differentiators.map((diff) => (
              <div
                key={diff.title}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{diff.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{diff.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* InspectIQ Summary */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-blue-600 rounded-2xl px-6 sm:px-12 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to let AI run your inspection business?
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-3">
            13 AI agents. $99/month flat. Report writing, follow-ups, review requests,
            scheduling, marketing, and more — all autonomous.
          </p>
          <p className="text-blue-200 text-sm mb-8">14-day free trial. No credit card required.</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Start Your Free Trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <p className="text-lg font-bold text-white">InspectIQ</p>
              <p className="mt-1 text-sm text-slate-400">AI that runs your inspection business.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Log In</Link>
              <Link href="/sample-report" className="hover:text-white transition-colors">Sample Report</Link>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} InspectIQ. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
