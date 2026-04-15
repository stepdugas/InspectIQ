import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/auth/login', '/auth/signup', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/admin/', '/api/', '/report/'],
      },
    ],
    sitemap: 'https://www.useinspectiq.com/sitemap.xml',
  }
}
