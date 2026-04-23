import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // @react-pdf/renderer is ESM-only — transpile it so webpack can bundle it
  transpilePackages: ['@react-pdf/renderer'],
}

export default nextConfig
