import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'InspectIQ terms of service. Read before using our home inspection software.',
  alternates: { canonical: 'https://www.useinspectiq.com/terms' },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
