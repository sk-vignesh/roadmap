import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'Roadmap'
  const votes = searchParams.get('votes') ?? '0'
  const board = searchParams.get('board') ?? ''
  const boardColor = searchParams.get('color') ?? '#6366f1'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#09090b',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top badge */}
        <div style={{ display: 'flex', marginBottom: '24px' }}>
          <div
            style={{
              backgroundColor: '#27272a',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '16px',
              color: '#a1a1aa',
              display: 'flex',
            }}
          >
            🗺️ Roadmap
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              fontSize: title.length > 60 ? '40px' : '52px',
              fontWeight: 700,
              color: '#fafafa',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {title}
          </p>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginTop: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#18181b',
              borderRadius: '8px',
              padding: '8px 16px',
            }}
          >
            <span style={{ color: '#fafafa', fontSize: '20px', fontWeight: 700 }}>
              ▲ {votes}
            </span>
            <span style={{ color: '#71717a', fontSize: '16px' }}>votes</span>
          </div>
          {board && (
            <div
              style={{
                display: 'flex',
                backgroundColor: `${boardColor}22`,
                borderRadius: '8px',
                padding: '8px 16px',
              }}
            >
              <span style={{ color: boardColor, fontSize: '16px', fontWeight: 600 }}>
                {board}
              </span>
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
