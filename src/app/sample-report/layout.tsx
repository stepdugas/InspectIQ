import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sample Home Inspection Report | See InspectIQ in Action',
  description:
    'View a sample AI-generated home inspection report. Room-by-room findings, photo annotations, and branded PDF. Start your 14-day free trial.',
  openGraph: {
    title: 'Sample Home Inspection Report | See InspectIQ in Action',
    description:
      'View a sample AI-generated home inspection report. Room-by-room findings, photo annotations, and branded PDF. Start your 14-day free trial.',
    url: 'https://www.useinspectiq.com/sample-report',
  },
  alternates: { canonical: 'https://www.useinspectiq.com/sample-report' },
}

export default function SampleReportLayout({ children }: { children: React.ReactNode }) {
  return children
}
