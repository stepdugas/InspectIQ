import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Shared navbar for all public/marketing pages.
// Hash links (/#features etc.) work from any route — they navigate to the
// homepage and scroll to the section. On the homepage itself the browser
// handles the anchor natively (no full reload).

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Founding Members', href: '/#founding' },
  { label: 'Blog', href: '/blog' },
  { label: 'Sample Report', href: '/sample-report' },
]

export default function PublicNav({ activePath }: { activePath?: string }) {
  return (
    <nav className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-slate-900">InspectIQ</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
          {NAV_LINKS.map((link) => {
            const isActive = activePath === link.href || (activePath?.startsWith(link.href) && link.href !== '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-slate-900 transition-colors ${isActive ? 'font-medium text-blue-600' : ''}`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="hover:bg-slate-100 transition-colors">Log in</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm">Start Free Trial</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
