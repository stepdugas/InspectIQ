import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Building2, ArrowLeft } from 'lucide-react'
import { getAllPosts, getPostBySlug } from '@/lib/blog'

// Pre-render every blog post at build time
export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.meta.slug }))
}

// Dynamic SEO metadata pulled from the post frontmatter
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found' }

  const { title, description, ogImage } = post.meta
  const url = `https://www.useinspectiq.com/blog/${slug}`

  return {
    title: `${title} — InspectIQ Blog`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: ogImage }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const canonicalUrl = `https://www.useinspectiq.com/blog/${slug}`

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.useinspectiq.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.useinspectiq.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.meta.title, item: canonicalUrl },
    ],
  }

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta.title,
    description: post.meta.description,
    datePublished: post.meta.publishedAt,
    author: { '@type': 'Organization', name: 'InspectIQ', url: 'https://www.useinspectiq.com' },
    publisher: { '@type': 'Organization', name: 'InspectIQ', url: 'https://www.useinspectiq.com' },
    mainEntityOfPage: canonicalUrl,
    image: post.meta.ogImage,
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to blog
        </Link>

        {/* Post header */}
        <header className="mb-10">
          <time className="text-sm text-slate-400">
            {new Date(post.meta.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            {post.meta.title}
          </h1>
          {post.meta.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* MDX content with prose styling */}
        <article className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
          <MDXRemote source={post.content} />
        </article>
      </main>
    </div>
  )
}
