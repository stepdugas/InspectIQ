import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.useinspectiq.com'),
  title: {
    default: 'InspectIQ — Home Inspection Software That Writes Reports For You',
    template: '%s | InspectIQ',
  },
  description:
    'InspectIQ is home inspection software that writes your report narratives using AI. Annotate photos, collect client payments, schedule jobs, and deliver branded PDF reports — all from your phone. InterNACHI standards pre-loaded. 14-day free trial.',
  keywords: [
    'home inspection software',
    'home inspection report software',
    'AI home inspection reports',
    'home inspector app',
    'home inspection report generator',
    'InterNACHI inspection software',
    'home inspection photo annotation',
    'home inspector scheduling software',
    'home inspection client payment',
    'home inspection PDF report',
    'Spectora alternative',
    'home inspection app for iPhone',
    'home inspection report writer',
    'inspection narrative generator',
  ],
  authors: [{ name: 'InspectIQ' }],
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
    title: 'InspectIQ — Home Inspection Software That Writes Reports For You',
    description: 'AI writes your room narratives. Annotate photos. Collect client payments. Schedule jobs. Branded PDF reports delivered the same day. 14-day free trial.',
    type: 'website',
    url: 'https://www.useinspectiq.com',
    siteName: 'InspectIQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InspectIQ — Home Inspection Software That Writes Reports For You',
    description: 'AI writes your room narratives. Annotate photos, collect payments, and deliver branded PDF reports — all from your phone. 14-day free trial.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.className} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster />
          <Link
            href="/admin/login"
            className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-9 h-9 rounded-full bg-slate-800/80 hover:bg-purple-700 border border-slate-600 hover:border-purple-500 text-slate-400 hover:text-white transition-all duration-200 shadow-lg backdrop-blur-sm"
            title="Admin"
          >
            <ShieldCheck className="h-4 w-4" />
          </Link>
        </body>
      </html>
    </ClerkProvider>
  )
}
