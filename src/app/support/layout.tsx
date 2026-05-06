import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support & FAQ',
  description:
    'Get help with InspectIQ. FAQs about inspections, reports, payments, templates, and more.',
  alternates: { canonical: 'https://www.useinspectiq.com/support' },
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
