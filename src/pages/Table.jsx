import { Trophy, TrendingUp } from 'lucide-react'
import { useApi } from '../hooks/useApi'

export default function Table() {
  const { data, loading } = useApi('/api/table')
  const table = data?.table || []

  function posIcon(pos) {
    if (pos === 1) return '🥇'
    if (pos === 2) return '🥈'
    if (pos === 3) return '🥉'
    return pos
  }

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(233,124,48,0.15) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(233,124,48,0.2)',
        padding: '3rem 0 2rem',
      }}>
        <div className="container">
          <h1 className="section-title">LEAGUE <span>TABLE</span></h1>
          <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>
            {data?.source === 'sample'
              ? 'Sample data — live FA Full-Time data not yet available'
              : `${data?.source === 'fa-live' ? 'Live from FA Full-Time · ' : data?.source === 'manual' ? 'Updated by the club · ' : ''}Updated ${data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : ''}`}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        )}

        {!loading && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--orange)' }}>
                  {['#', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map(h => (
                    <th key={h} style={{
                      padding: '0.75rem 1rem', textAlign: h === 'Team' ? 'left' : 'center',
                      color: 'var(--orange)', fontFamily: 'Poppins', fontSize: '1rem', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => {
                  const isFoxes = row.team?.toLowerCase().includes('foxes') || row.team?.toLowerCase().includes('streatham') || row.team?.toLowerCase().includes('balham')
                  return (
                    <tr key={i} style={{
                      background: isFoxes ? 'rgba(233,124,48,0.1)' : i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => { if (!isFoxes) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { if (!isFoxes) e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                    >
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', width: 50 }}>
                        <span style={{ fontFamily: 'Poppins', fontSize: '1.1rem', color: i < 3 ? 'var(--orange)' : 'var(--gray)' }}>
                          {posIcon(row.position)}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: isFoxes ? 700 : 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isFoxes && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--orange)', display: 'inline-block', flexShrink: 0 }} />}
                          <span style={{ color: isFoxes ? 'var(--orange)' : 'white' }}>{row.team}</span>
                        </div>
                      </td>
                      {[row.played, row.won, row.drawn, row.lost, row.gf, row.ga, row.gd].map((v, j) => (
                        <td key={j} style={{ padding: '0.85rem 1rem', textAlign: 'center', color: 'var(--gray)' }}>{v}</td>
                      ))}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: isFoxes ? 'var(--orange)' : 'white' }}>{row.points}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && table.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray)' }}>
            <Trophy size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>League table data unavailable</p>
          </div>
        )}
      </div>
    </div>
  )
}
