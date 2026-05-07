'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Founding Members', href: '/#founding' },
  { label: 'Blog', href: '/blog' },
  { label: 'Sample Report', href: '/sample-report' },
]

export default function PublicNav({ activePath }: { activePath?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-slate-900">InspectIQ</span>
        </Link>

        {/* Desktop nav */}
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
          <Link href="/auth/login" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="hover:bg-slate-100 transition-colors">Log in</Button>
          </Link>
          <Link href="/auth/signup" className="hidden sm:block">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm">Start Free Trial</Button>
          </Link>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 -mr-2 text-slate-600 hover:text-slate-900"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = activePath === link.href || (activePath?.startsWith(link.href) && link.href !== '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="flex gap-2 pt-2 px-3">
              <Link href="/auth/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Log in</Button>
              </Link>
              <Link href="/auth/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
