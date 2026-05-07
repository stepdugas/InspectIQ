import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PublicNav from '@/components/layout/PublicNav'
import { Card, CardContent } from '@/components/ui/card'
import { getAllPosts } from '@/lib/blog'

const TOPIC_THEMES: Record<string, { from: string; to: string; icon: string }> = {
  'ai': { from: 'from-violet-600', to: 'to-indigo-900', icon: '🤖' },
  'template': { from: 'from-cyan-600', to: 'to-slate-900', icon: '📋' },
  'deck': { from: 'from-lime-600', to: 'to-slate-900', icon: '🏗️' },
  'termite': { from: 'from-amber-600', to: 'to-slate-900', icon: '🔍' },
  'internachi': { from: 'from-blue-600', to: 'to-slate-900', icon: '🛡️' },
  'software': { from: 'from-sky-600', to: 'to-slate-900', icon: '💻' },
  'write': { from: 'from-indigo-600', to: 'to-slate-900', icon: '✍️' },
}

function getTheme(title: string) {
  const lower = title.toLowerCase()
  for (const [key, theme] of Object.entries(TOPIC_THEMES)) {
    if (lower.includes(key)) return theme
  }
  return { from: 'from-blue-600', to: 'to-slate-900', icon: '📄' }
}

export const metadata: Metadata = {
  title: 'InspectIQ Blog — Home Inspection Software Tips & Guides',
  description:
    'Practical guides, tips, and industry insights for home inspectors. Learn how to write better reports, grow your business, and save time with AI-powered inspection software.',
  openGraph: {
    title: 'InspectIQ Blog — Home Inspection Software Tips & Guides',
    description:
      'Practical guides, tips, and industry insights for home inspectors.',
    url: 'https://www.useinspectiq.com/blog',
    images: [{ url: '/og-blog-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InspectIQ Blog — Home Inspection Software Tips & Guides',
    description:
      'Practical guides, tips, and industry insights for home inspectors.',
    images: ['/og-blog-default.png'],
  },
  alternates: { canonical: 'https://www.useinspectiq.com/blog' },
}

export default function BlogListingPage() {
  const posts = getAllPosts()

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.useinspectiq.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.useinspectiq.com/blog' },
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PublicNav activePath="/blog" />

      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Home Inspection Tips &amp; Guides</h1>
        <p className="mt-3 text-lg text-slate-500">
          Tips, guides, and industry insights for home inspectors.
        </p>
      </header>

      {/* Post grid */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        {posts.length === 0 ? (
          <p className="text-slate-400 text-center py-16">
            No posts yet. Check back soon!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => {
              const theme = getTheme(post.meta.title)
              return (
                <Link key={post.meta.slug} href={`/blog/${post.meta.slug}`}>
                  <Card className="h-full hover:shadow-md transition-shadow border-slate-200 overflow-hidden">
                    {/* Topic-colored hero banner */}
                    <div className={`bg-gradient-to-br ${theme.from} ${theme.to} px-6 py-8 flex items-end gap-3`}>
                      <span className="text-3xl">{theme.icon}</span>
                      <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">InspectIQ Blog</span>
                    </div>
                    <CardContent className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <time className="text-xs text-slate-400">
                          {new Date(post.meta.publishedAt).toLocaleDateString(
                            'en-US',
                            { year: 'numeric', month: 'long', day: 'numeric' }
                          )}
                        </time>
                        <h2 className="mt-2 text-lg font-semibold text-slate-900 leading-snug">
                          {post.meta.title}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-3">
                          {post.meta.description}
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                        Read more <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
