import { SignIn } from '@clerk/nextjs'
import { Building2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Building2 className="h-6 w-6 text-blue-600" />
        <span className="font-bold text-xl text-slate-900">InspectIQ</span>
      </Link>
      <SignIn forceRedirectUrl="/dashboard" />
    </div>
  )
}
