import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sample Home Inspection Report | InspectIQ',
  description: 'See what a professional home inspection report looks like when generated with InspectIQ. Branded PDF with AI-written narratives, annotated photos, and InterNACHI-standard findings — delivered the same day.',
  openGraph: {
    title: 'Sample Home Inspection Report | InspectIQ',
    description: 'See what a professional home inspection report looks like when generated with InspectIQ — AI narratives, annotated photos, branded PDF.',
    url: 'https://www.useinspectiq.com/sample-report',
  },
  alternates: { canonical: 'https://www.useinspectiq.com/sample-report' },
}

export default function SampleReportLayout({ children }: { children: React.ReactNode }) {
  return children
}
