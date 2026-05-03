import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// Where MDX blog posts live on disk
const BLOG_DIR = path.join(process.cwd(), 'src/content/blog')

export interface BlogPostMeta {
  title: string
  description: string
  slug: string
  publishedAt: string
  tags: string[]
  ogImage: string
}

export interface BlogPost {
  meta: BlogPostMeta
  content: string
}

/**
 * Reads all .mdx files from src/content/blog/, parses frontmatter,
 * and returns them sorted by date descending (newest first).
 */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))

  const posts = files.map((filename) => {
    const filePath = path.join(BLOG_DIR, filename)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)

    return {
      meta: {
        title: data.title ?? '',
        description: data.description ?? '',
        slug: data.slug ?? filename.replace('.mdx', ''),
        publishedAt: data.publishedAt ?? '',
        tags: data.tags ?? [],
        ogImage: data.ogImage ?? '/og-blog-default.png',
      },
      content,
    } satisfies BlogPost
  })

  // Newest first
  return posts.sort(
    (a, b) =>
      new Date(b.meta.publishedAt).getTime() -
      new Date(a.meta.publishedAt).getTime()
  )
}

/**
 * Returns a single blog post by slug, or null if not found.
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts()
  return posts.find((p) => p.meta.slug === slug) ?? null
}
