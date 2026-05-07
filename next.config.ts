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
}

export default nextConfig
