import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getAllPosts } from '@/lib/blog'

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
      {/* Nav */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
          >
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-slate-900">InspectIQ</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <Link
              href="/blog"
              className="hover:text-slate-900 transition-colors font-medium text-blue-600"
            >
              Blog
            </Link>
            <Link
              href="/sample-report"
              className="hover:text-slate-900 transition-colors"
            >
              Sample Report
            </Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/auth/login"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

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
            {posts.map((post) => (
              <Link key={post.meta.slug} href={`/blog/${post.meta.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow border-slate-200">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
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
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
