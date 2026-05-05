import type { Metadata } from 'next'
import { SignUp } from '@clerk/nextjs'
import { Building2, CheckCircle2, Star } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Start Your Free Trial | InspectIQ',
  description: '14-day free trial, no credit card required. Join home inspectors using InspectIQ to write reports faster with AI.',
  robots: { index: false, follow: false },
}

const benefits = [
  'AI writes your room narratives — no manual typing',
  'Loads fast on spotty connections',
  'Annotate photos with arrows, boxes & text',
  'Collect client payments directly in the app',
  'InterNACHI standards pre-loaded',
  'Branded PDF reports with your logo & signature',
]

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — value prop ── */}
      <div className="hidden md:flex flex-col justify-between w-[52%] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-12 relative overflow-hidden">

        {/* Background glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <Building2 className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-xl text-white">InspectIQ</span>
        </Link>

        {/* Main copy */}
        <div className="relative z-10 my-auto">
          <div className="inline-block text-xs font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3 py-1 rounded-full mb-6">
            14-day free trial · No credit card required
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Inspection reports<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              in minutes, not hours.
            </span>
          </h1>

          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
            Join inspectors who&apos;ve cut their report time by 80% and started delivering reports the same day.
          </p>

          <ul className="space-y-3.5 mb-6">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                {b}
              </li>
            ))}
          </ul>

          <Link href="/sample-report" target="_blank" className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium mb-12 transition-colors">
            <CheckCircle2 className="h-3.5 w-3.5" />
            See a sample report →
          </Link>

          {/* Founding member callout */}
          <div className="border border-white/10 bg-white/5 backdrop-blur rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wide">Founding Member Offer</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              We&apos;re signing up our first 50 inspectors now. Founding members lock in $99/month — forever — even when pricing goes up.
            </p>
            <div className="space-y-1.5">
              {['Price locked in forever', 'Feature request priority', 'Direct founder access'].map(b => (
                <div key={b} className="flex items-center gap-2 text-slate-400 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-blue-400 shrink-0" />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <p className="text-slate-600 text-xs relative z-10">
          © {new Date().getFullYear()} InspectIQ · <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link> · <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
        </p>
      </div>

      {/* ── Right panel — signup form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6">

        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-slate-900">InspectIQ</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900">Start your free trial</h2>
            <p className="text-slate-500 text-sm mt-1">14 days free. No credit card needed.</p>
          </div>

          <SignUp forceRedirectUrl="/dashboard" />

          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
