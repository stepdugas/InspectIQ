import type { Metadata } from 'next'
import AnimatedLanding from '@/components/landing/AnimatedLanding'

export const metadata: Metadata = {
  title: 'InspectIQ — Hire Your First AI Employee for $99/month',
  description: '13 AI agents that handle report writing, client follow-ups, review requests, scheduling, and marketing — so you can focus on inspections. 14-day free trial, no credit card required.',
  openGraph: {
    title: 'InspectIQ — Hire Your First AI Employee for $99/month',
    description: '13 autonomous AI agents handle your admin work: reports, scheduling, follow-ups, reviews, marketing, and more. Built for solo home inspectors doing 2-3 inspections/day.',
    url: 'https://www.useinspectiq.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InspectIQ — Hire Your First AI Employee for $99/month',
    description: '13 AI agents that run your inspection business while you inspect. Reports, scheduling, reviews, follow-ups — all autonomous. 14-day free trial.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: 'https://www.useinspectiq.com' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'InspectIQ',
      url: 'https://www.useinspectiq.com',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'AI-powered home inspection platform with 13 autonomous agents that handle report writing, scheduling, client follow-ups, Google review requests, realtor nurture, marketing, and more.',
      offers: {
        '@type': 'Offer',
        price: '99.00',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '99.00',
          priceCurrency: 'USD',
          unitText: 'MONTH',
        },
        description: '14-day free trial, no credit card required. Cancel anytime.',
      },
      featureList: [
        '13 autonomous AI agents',
        'AI report writing agent',
        'Automated report delivery',
        'Client follow-up sequences',
        'Google review request automation',
        'Realtor relationship nurture',
        'Repair summary generation',
        'Scheduling and booking page',
        'Compliance tracking',
        'Lead qualification',
        'Business intelligence dashboard',
        'After-hours email handling',
        'Marketing content generation',
        'Property research and permits',
      ],
      screenshot: 'https://www.useinspectiq.com/og-image.png',
      creator: {
        '@type': 'Organization',
        name: 'InspectIQ',
        url: 'https://www.useinspectiq.com',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is InspectIQ really autonomous?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Once you connect your tools and set your preferences, the 13 AI agents work autonomously. They send follow-ups, request reviews, nurture realtor relationships, and handle after-hours emails — without you lifting a finger. You stay in control with a dashboard showing everything they do.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does InspectIQ cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'InspectIQ is $99/month for everything — all 13 AI agents, unlimited inspections, unlimited reports, your own branded booking page, and all future agents we add. There is a 14-day free trial with no credit card required.',
          },
        },
        {
          '@type': 'Question',
          name: 'What if I do not want all 13 agents?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can enable or disable any agent from your dashboard. Start with just the Report Writer if you want, then turn on more agents as you get comfortable. You are always in control.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to be technical to use InspectIQ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Not at all. If you can use email and a smartphone, you can use InspectIQ. Setup takes about 10 minutes — connect your email, set your preferences, and your AI team starts working. No coding, no integrations to build, no IT department needed.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is InspectIQ different from Spectora or ISN?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Spectora and ISN are tools — they help you do work faster. InspectIQ is an AI workforce — it does the work for you. Spectora has AI text suggestions. InspectIQ has 13 autonomous agents that write reports, send follow-ups, request reviews, nurture realtors, and run your marketing. Nobody else has this.',
          },
        },
      ],
    },
  ],
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnimatedLanding />
    </>
  )
}
