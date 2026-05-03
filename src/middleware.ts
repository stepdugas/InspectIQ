import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth(.*)',
  '/report(.*)',
  '/agreement(.*)',
  '/api/agreement(.*)',
  '/payment-success',
  '/payment-cancelled',
  '/sample-report',
  '/support',
  '/privacy',
  '/terms',
  '/api/stripe/webhook',
  '/admin(.*)',
  '/api/admin/auth',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
  const response = NextResponse.next()
  response.headers.set('x-pathname', request.nextUrl.pathname)

  // Capture referral code from ?ref=CODE and store in cookie for signup
  const ref = request.nextUrl.searchParams.get('ref')
  if (ref) {
    response.cookies.set('referral_code', ref, { maxAge: 60 * 60 * 24 * 7, path: '/' })
  }

  return response
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
