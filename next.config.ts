import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // @react-pdf/renderer is ESM-only — transpile it so webpack can bundle it
  transpilePackages: ['@react-pdf/renderer'],

  // Redirect old standalone routes to homepage hash anchors
  async redirects() {
    return [
      { source: '/features', destination: '/#features', permanent: true },
      { source: '/pricing', destination: '/#pricing', permanent: true },
      { source: '/founding-members', destination: '/#founding', permanent: true },
    ]
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
