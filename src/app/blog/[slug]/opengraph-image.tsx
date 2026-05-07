import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/blog'

export const alt = 'InspectIQ Blog'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Map keywords to accent colors and icons for visual variety
const TOPIC_THEMES: Record<string, { accent: string; icon: string }> = {
  'ai': { accent: '#8b5cf6', icon: '🤖' },
  'template': { accent: '#0891b2', icon: '📋' },
  'deck': { accent: '#65a30d', icon: '🏗️' },
  'termite': { accent: '#d97706', icon: '🔍' },
  'internachi': { accent: '#2563eb', icon: '🛡️' },
  'software': { accent: '#0ea5e9', icon: '💻' },
  'write': { accent: '#6366f1', icon: '✍️' },
  'roof': { accent: '#dc2626', icon: '🏠' },
  'plumbing': { accent: '#0284c7', icon: '🔧' },
  'electrical': { accent: '#eab308', icon: '⚡' },
  'mold': { accent: '#16a34a', icon: '🔬' },
  'radon': { accent: '#7c3aed', icon: '☢️' },
}

function getTheme(title: string) {
  const lower = title.toLowerCase()
  for (const [key, theme] of Object.entries(TOPIC_THEMES)) {
    if (lower.includes(key)) return theme
  }
  return { accent: '#3b82f6', icon: '📄' }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  const title = post?.meta.title?.replace(/\s*\|.*$/, '') ?? 'InspectIQ Blog'
  const theme = getTheme(title)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
          padding: '60px 70px',
        }}
      >
        {/* Accent gradient orb */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.accent}40 0%, transparent 70%)`,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.accent}20 0%, transparent 70%)`,
            display: 'flex',
          }}
        />

        {/* Top: Blog badge + icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              fontSize: '48px',
              display: 'flex',
            }}
          >
            {theme.icon}
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: theme.accent,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              display: 'flex',
            }}
          >
            InspectIQ Blog
          </div>
        </div>

        {/* Middle: Post title */}
        <div
          style={{
            fontSize: title.length > 40 ? '44px' : '52px',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.2,
            maxWidth: '1000px',
            display: 'flex',
          }}
        >
          {title}
        </div>

        {/* Bottom: Branding bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                background: `linear-gradient(135deg, ${theme.accent} 0%, #2563eb 100%)`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              IQ
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#e2e8f0', display: 'flex' }}>
              InspectIQ
            </div>
          </div>
          <div style={{ fontSize: '16px', color: '#64748b', display: 'flex' }}>
            useinspectiq.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
