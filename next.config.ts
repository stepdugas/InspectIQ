import type { NextConfig } from 'next'
import withPWA from '@ducanh2912/next-pwa'

const nextConfig: NextConfig = {
  // @react-pdf/renderer is ESM-only — transpile it so webpack can bundle it
  transpilePackages: ['@react-pdf/renderer'],
}

export default withPWA({
  dest: 'public',
  // Disable PWA service worker in development to avoid interference
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    // Cache inspection API responses so they work offline
    runtimeCaching: [
      {
        urlPattern: /^\/api\/inspections/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'inspections-api',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
          networkTimeoutSeconds: 5,
        },
      },
      {
        urlPattern: /^\/api\/templates/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'templates-api',
          expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
          networkTimeoutSeconds: 5,
        },
      },
      {
        // Cache Cloudinary photos for offline viewing
        urlPattern: /^https:\/\/res\.cloudinary\.com\//,
        handler: 'CacheFirst',
        options: {
          cacheName: 'inspection-photos',
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
    ],
  },
})(nextConfig)
