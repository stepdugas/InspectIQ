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
    default: 'InspectIQ — AI Home Inspection Report Software',
    template: '%s | InspectIQ',
  },
  description:
    'InspectIQ generates professional, branded home inspection PDF reports in minutes using AI. InterNACHI standards pre-loaded. One-click AI narratives. Client share links. Built for licensed home inspectors.',
  keywords: [
    'home inspection software',
    'home inspection report generator',
    'AI home inspection reports',
    'home inspector software',
    'inspection report app',
    'InterNACHI inspection software',
    'home inspection PDF generator',
    'home inspector tools',
  ],
  authors: [{ name: 'InspectIQ' }],
  creator: 'InspectIQ',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'InspectIQ — AI Home Inspection Report Software',
    description: 'Generate professional, branded inspection reports in minutes. InterNACHI standards pre-loaded. AI narratives. Client share links. PDF export.',
    type: 'website',
    url: 'https://www.useinspectiq.com',
    siteName: 'InspectIQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InspectIQ — AI Home Inspection Report Software',
    description: 'Generate professional home inspection reports in minutes with AI. Built for licensed home inspectors.',
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
