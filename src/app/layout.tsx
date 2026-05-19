import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.useinspectiq.com'),
  verification: {
    google: 'BIS6steIHyp44cBAIX51CfZzCMvlZF-yelLPiWg8dKs',
  },
  title: {
    default: 'InspectIQ — Hire Your First AI Employee for $99/month',
    template: '%s | InspectIQ',
  },
  description:
    '13 AI agents that handle report writing, client follow-ups, review requests, scheduling, and marketing for home inspectors. You inspect — they handle everything else. 14-day free trial.',
  keywords: [
    'AI home inspection software',
    'home inspection AI agents',
    'home inspection report software',
    'AI home inspection reports',
    'home inspector scheduling software',
    'home inspection software comparison',
    'best home inspection software 2026',
    'home inspection report generator',
    'InterNACHI inspection software',
    'home inspector app',
    'AI inspection report writer',
    'home inspection automation',
    'home inspection business software',
    'home inspector AI assistant',
    'home inspection client follow up',
    'home inspector review management',
    'TREC 7-6 inspection software',
    'home inspection booking page',
    'ISN integration home inspection',
  ],
  authors: [{ name: 'Stephanie Dugas', url: 'https://www.useinspectiq.com' }],
  creator: 'InspectIQ',
  // PWA manifest + theme
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'InspectIQ',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'InspectIQ — Hire Your First AI Employee for $99/month',
    description: '13 autonomous AI agents handle your admin work: reports, scheduling, follow-ups, reviews, realtor nurture, and more. Built for solo home inspectors.',
    type: 'website',
    url: 'https://www.useinspectiq.com',
    siteName: 'InspectIQ',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'InspectIQ — 13 AI Agents for Home Inspectors' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InspectIQ — Hire Your First AI Employee for $99/month',
    description: '13 AI agents that run your inspection business while you inspect. Reports, scheduling, reviews, follow-ups — all autonomous. 14-day free trial.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://www.useinspectiq.com',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'InspectIQ',
  url: 'https://www.useinspectiq.com',
  logo: 'https://www.useinspectiq.com/icon.svg',
  description: '13 AI agents that run your home inspection business. Reports, scheduling, follow-ups, reviews, and more — all autonomous.',
  founder: { '@type': 'Person', name: 'Stephanie Dugas' },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@useinspectiq.com',
    contactType: 'customer support',
    url: 'https://www.useinspectiq.com/support',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.className} h-full antialiased`}>
        <head>
          <meta name="google-site-verification" content="BIS6steIHyp44cBAIX51CfZzCMvlZF-yelLPiWg8dKs" />
        </head>
        <body className="min-h-full flex flex-col">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
