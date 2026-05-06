import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'InspectIQ privacy policy. How we collect, use, and protect your data.',
  alternates: { canonical: 'https://www.useinspectiq.com/privacy' },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
