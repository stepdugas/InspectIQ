import type { Metadata } from 'next'
import AnimatedLanding from '@/components/landing/AnimatedLanding'

export const metadata: Metadata = {
  title: 'InspectIQ — Home Inspection Software That Writes Reports For You',
  description: 'InspectIQ writes your home inspection report narratives using AI. A modern Spectora and HomeGauge alternative with photo annotation, client payments, scheduling, and branded PDF reports. InterNACHI standards pre-loaded. $99/mo, 14-day free trial.',
  openGraph: {
    title: 'InspectIQ — Home Inspection Software That Writes Reports For You',
    description: 'AI writes your room narratives. A Spectora and HomeGauge alternative with photo annotation, payments, scheduling, and branded PDF reports. 14-day free trial.',
    url: 'https://www.useinspectiq.com',
  },
  twitter: {
    title: 'InspectIQ — Home Inspection Software That Writes Reports For You',
    description: 'AI writes your room narratives. Annotate photos, collect payments, and deliver branded PDF reports from your phone. 14-day free trial.',
  },
  alternates: { canonical: 'https://www.useinspectiq.com' },
}

// JSON-LD structured data — tells Google this is software with a price/trial,
// and FAQ schema generates accordion rich results in search (more SERP real estate = more clicks)
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'InspectIQ',
      url: 'https://www.useinspectiq.com',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'iOS, Android, Web',
      description: 'Home inspection software that writes report narratives using AI. A modern alternative to Spectora, HomeGauge, and Palm-Tech. Features include photo annotation, client payment collection, scheduling, custom templates, and branded PDF reports. InterNACHI standards pre-loaded.',
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
        'AI-generated inspection report narratives',
        'Photo annotation with arrows, boxes, and text',
        'Client payment collection via Stripe',
        'Built-in scheduling calendar',
        'Custom inspection templates',
        'InterNACHI standards pre-loaded',
        'Branded PDF reports with logo and signature',
        'Installs to phone home screen — works in low-signal areas',
        'Email reports directly to clients',
        'Secure client share links',
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
          name: 'How much does InspectIQ cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'InspectIQ is $99/month with unlimited inspections and reports. There is a 14-day free trial with no credit card required. An annual plan is available at $79/month ($948/year). Founding members who sign up early lock in $99/month forever, even when prices increase.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is InspectIQ a Spectora alternative?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. InspectIQ is a direct Spectora alternative built for licensed home inspectors. It includes AI-generated report narratives, photo annotation, client payment collection, scheduling, and custom templates — at $99/month vs Spectora\'s higher pricing. InspectIQ also installs directly to your phone\'s home screen without going through the App Store.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does InspectIQ work without internet or in low-signal areas?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'InspectIQ installs to your phone\'s home screen like a native app. The app and your recent inspections load instantly in low-signal areas like basements and crawlspaces. It works great with spotty LTE — no full offline mode required for most inspections.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I annotate photos inside InspectIQ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. InspectIQ includes built-in photo annotation. You can draw arrows, boxes, circles, and add text labels directly on your inspection photos — right inside the app. No separate app needed. Annotated photos are included in your PDF report.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does it take to write a report with InspectIQ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most inspectors finish their report on-site or within minutes of completing the inspection. You enter your findings room by room, then click Generate AI — InspectIQ writes the professional narrative for every room instantly. Most inspectors report cutting their report writing time by 80% or more.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does InspectIQ use InterNACHI standards?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. InspectIQ comes pre-loaded with InterNACHI Standards of Practice checklists so every report reflects the highest industry standards automatically. You can also create custom templates for commercial, pool, radon, sewer scope, and specialty inspections.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I collect client payments through InspectIQ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. InspectIQ lets you set your inspection fee and generate a secure Stripe payment link with one click. Email it to your client — they pay online, you get notified, and the inspection is marked as paid automatically. No separate payment app needed.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does an InspectIQ report look like?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'InspectIQ generates branded PDF reports that include your company logo, license number, digital signature, and contact information. Each report includes professional AI-written narratives for every room, annotated photos, and a findings summary. You can view a sample report at useinspectiq.com/sample-report.',
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
