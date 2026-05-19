import { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/cities'
import { getAllPosts } from '@/lib/blog'

const COMPETITOR_SLUGS = ['spectora', 'homegauge', 'isn'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const cityPages: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `https://www.useinspectiq.com/locations/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `https://www.useinspectiq.com/blog/${post.meta.slug}`,
    lastModified: new Date(post.meta.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const competitorPages: MetadataRoute.Sitemap = COMPETITOR_SLUGS.map((slug) => ({
    url: `https://www.useinspectiq.com/vs/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
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
      url: 'https://www.useinspectiq.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
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
    // State-specific landing pages
    {
      url: 'https://www.useinspectiq.com/texas',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.useinspectiq.com/florida',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.useinspectiq.com/california',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.useinspectiq.com/illinois',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.useinspectiq.com/new-york',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...competitorPages,
    ...blogPages,
    ...cityPages,
  ]
}
