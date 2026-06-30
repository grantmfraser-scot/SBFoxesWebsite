import { useState } from 'react'
import { Calendar, Clock, MapPin, RefreshCw } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import axios from 'axios'

function ResultBadge({ score, isHome }) {
  if (!score || score === 'vs') return null
  const parts = score.replace(/\s/g, '').split(/[-–]/).map(Number)
  if (parts.length < 2 || parts.some(isNaN)) return null
  const [a, b] = parts
  const foxScore = isHome ? a : b
  const oppScore = isHome ? b : a
  if (foxScore > oppScore) return <span className="badge badge-win">WIN</span>
  if (foxScore < oppScore) return <span className="badge badge-loss">LOSS</span>
  return <span className="badge badge-draw">DRAW</span>
}

function FixtureCard({ item, isResult }) {
  const isFoxesHome = item.home?.toLowerCase().includes('foxes') || item.home?.toLowerCase().includes('streatham') || item.home?.toLowerCase().includes('balham')
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={10} />
            {item.date}
            {isResult && <ResultBadge score={item.score} isHome={isFoxesHome} />}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', textAlign: 'right', color: isFoxesHome ? 'var(--orange)' : 'white' }}>
              {item.home}
            </div>
            <div style={{
              fontFamily: 'Poppins', fontSize: isResult ? '1.5rem' : '1rem',
              color: isResult ? 'white' : 'var(--gray)',
              minWidth: 60, textAlign: 'center', lineHeight: 1
            }}>
              {item.score || 'vs'}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: !isFoxesHome ? 'var(--orange)' : 'white' }}>
              {item.away}
            </div>
          </div>
        </div>
      </div>

      {item.venue && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gray)', fontSize: '0.75rem' }}>
          <MapPin size={11} />
          {item.venue}
        </div>
      )}
    </div>
  )
}

export default function Fixtures() {
  const [tab, setTab] = useState('fixtures')
  const { data, loading, error } = useApi('/api/fixtures')
  const [refreshing, setRefreshing] = useState(false)

  async function refresh() {
    setRefreshing(true)
    try { await axios.get('/api/fixtures') } catch {}
    window.location.reload()
    setRefreshing(false)
  }

  const items = tab === 'fixtures' ? (data?.fixtures || []) : (data?.results || [])

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(233,124,48,0.15) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(233,124,48,0.2)',
        padding: '3rem 0 2rem',
      }}>
        <div className="container">
          <h1 className="section-title">FIXTURES &amp; <span>RESULTS</span></h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>
              Data from FA Fulltime · {data?.lastUpdated ? `Updated ${new Date(data.lastUpdated).toLocaleString()}` : 'Loading...'}
              {data?.isMock && <span style={{ color: 'var(--orange)', marginLeft: '0.5rem' }}>(sample data — FA site may be unavailable)</span>}
            </p>
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} onClick={refresh} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spinning' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--dark2)', borderRadius: 8, padding: '0.25rem', marginBottom: '2rem', width: 'fit-content' }}>
          {['fixtures', 'results'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.6rem 1.5rem', borderRadius: 6, border: 'none',
              background: tab === t ? 'var(--orange)' : 'transparent',
              color: tab === t ? 'white' : 'var(--gray)',
              fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}>{t === 'fixtures' ? 'Upcoming' : 'Results'}</button>
          ))}
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray)' }}>
            <Calendar size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>No {tab} found</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item, i) => (
            <FixtureCard key={i} item={item} isResult={tab === 'results'} />
          ))}
        </div>
      </div>

      <style>{`.spinning { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
