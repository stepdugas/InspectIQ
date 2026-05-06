import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Repair List',
  robots: { index: false },
}

export default function RepairsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
