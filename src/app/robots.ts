import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/sample-report', '/locations/', '/blog/', '/blog/*', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/admin/', '/api/', '/report/', '/auth/'],
      },
    ],
    sitemap: 'https://www.useinspectiq.com/sitemap.xml',
  }
}
