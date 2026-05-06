import { ImageResponse } from 'next/og'

export const alt = 'InspectIQ Blog — Home Inspection Tips, Templates & Software Guides'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Blue accent gradient orb top-right */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        {/* Blue accent gradient orb bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Logo / brand name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          {/* Shield icon */}
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 700,
            }}
          >
            IQ
          </div>
          <div
            style={{
              fontSize: '44px',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-1px',
              display: 'flex',
            }}
          >
            InspectIQ
          </div>
        </div>

        {/* Blog badge */}
        <div
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#3b82f6',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '20px',
            display: 'flex',
          }}
        >
          Blog
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#e2e8f0',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.3,
            marginBottom: '16px',
            display: 'flex',
          }}
        >
          Home Inspection Tips, Templates &amp; Software Guides
        </div>

        {/* Divider line */}
        <div
          style={{
            width: '80px',
            height: '4px',
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            borderRadius: '2px',
            margin: '12px 0 24px 0',
            display: 'flex',
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: '20px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '700px',
            display: 'flex',
          }}
        >
          Expert advice to help you run a more efficient inspection business
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            fontSize: '16px',
            color: '#64748b',
            display: 'flex',
          }}
        >
          useinspectiq.com/blog
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
