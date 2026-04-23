import { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/cities'

export default function sitemap(): MetadataRoute.Sitemap {
  const cityPages: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `https://www.useinspectiq.com/locations/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: 'https://www.useinspectiq.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      // High-intent page: people searching for what inspection reports look like are close to buying
      url: 'https://www.useinspectiq.com/sample-report',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://www.useinspectiq.com/privacy',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: 'https://www.useinspectiq.com/terms',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    ...cityPages,
  ]
}
