import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export async function GET() {
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
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '28px',
              fontWeight: 700,
            }}
          >
            IQ
          </div>
          <div
            style={{
              fontSize: '52px',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-1px',
              display: 'flex',
            }}
          >
            InspectIQ
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 600,
            color: '#e2e8f0',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.3,
            display: 'flex',
          }}
        >
          Home Inspection Software That Writes Reports For You
        </div>

        {/* Divider */}
        <div
          style={{
            width: '80px',
            height: '4px',
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            borderRadius: '2px',
            margin: '28px 0',
            display: 'flex',
          }}
        />

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '1000px',
          }}
        >
          {['AI-Powered Reports', 'Photo Annotation', 'Client Payments', 'Repair Lists'].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  fontSize: '18px',
                  color: '#94a3b8',
                  padding: '8px 20px',
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: '24px',
                  display: 'flex',
                }}
              >
                {feature}
              </div>
            )
          )}
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
          useinspectiq.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
