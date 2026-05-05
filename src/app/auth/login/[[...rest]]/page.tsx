import type { Metadata } from 'next'
import { SignIn } from '@clerk/nextjs'
import { Building2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Log In | InspectIQ',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden md:flex flex-col justify-between w-[52%] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-12 relative overflow-hidden">

        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <Building2 className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-xl text-white">InspectIQ</span>
        </Link>

        <div className="relative z-10 my-auto">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome back.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
            Your inspections, reports, and photos are right where you left them.
          </p>

          <div className="space-y-4">
            {[
              'AI narratives ready when you are',
              'Install to your home screen for quick access',
              'Reports delivered same day',
            ].map((b) => (
              <div key={b} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs relative z-10">
          © {new Date().getFullYear()} InspectIQ · <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link> · <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
        </p>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6">

        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-slate-900">InspectIQ</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900">Log in to InspectIQ</h2>
            <p className="text-slate-500 text-sm mt-1">Good to have you back.</p>
          </div>

          <SignIn forceRedirectUrl="/dashboard" />

          <p className="text-center text-xs text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
              Start your free trial
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
