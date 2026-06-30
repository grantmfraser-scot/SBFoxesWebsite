import { Link } from 'react-router-dom'
import { Trophy, Calendar, Image, Newspaper, ChevronRight, Zap } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { format, parseISO } from 'date-fns'

export default function Home() {
  const { data: fixturesData } = useApi('/api/fixtures')
  const { data: posts } = useApi('/api/posts')
  const { data: tableData } = useApi('/api/table')

  const nextFixture = fixturesData?.fixtures?.[0]
  const latestResult = fixturesData?.results?.[0]
  const top3 = tableData?.table?.slice(0, 3) || []
  const latestPosts = posts?.slice(0, 3) || []

  const teamName = 'Streatham & Balham Foxes Colts'

  function getResultBadge(result) {
    if (!result?.score) return null
    const [a, b] = result.score.replace(/\s/g, '').split(/[-–]/).map(Number)
    const isHome = result.home?.includes('Foxes') || result.home?.includes('Streatham')
    const foxScore = isHome ? a : b
    const oppScore = isHome ? b : a
    if (foxScore > oppScore) return <span className="badge badge-win">W</span>
    if (foxScore < oppScore) return <span className="badge badge-loss">L</span>
    return <span className="badge badge-draw">D</span>
  }

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 70,
      }}>
        {/* Animated background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(233,124,48,0.2) 0%, transparent 70%), linear-gradient(180deg, var(--black) 0%, #0a1726 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(233,124,48,0.03) 50px, rgba(233,124,48,0.03) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(233,124,48,0.03) 50px, rgba(233,124,48,0.03) 51px)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(233,124,48,0.12)', border: '1px solid rgba(233,124,48,0.3)',
              borderRadius: 100, padding: '0.4rem 1rem', marginBottom: '1.5rem',
              fontSize: '0.8rem', color: 'var(--orange)', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              <Zap size={12} />
              South London Youth Football
            </div>

            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.95, marginBottom: '1.5rem' }}>
              STREATHAM &<br />BALHAM<br /><span style={{ color: 'var(--orange)' }}>FOXES COLTS FC</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
              The pride of South London. Fast, fierce, and fearless — the Foxes are coming for the title.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/fixtures" className="btn btn-primary" style={{ fontSize: '0.95rem' }}>
                <Calendar size={16} /> View Fixtures
              </Link>
              <Link to="/table" className="btn btn-outline" style={{ fontSize: '0.95rem' }}>
                <Trophy size={16} /> League Table
              </Link>
            </div>
          </div>

          {/* Score cards */}
          {(nextFixture || latestResult) && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '4rem', flexWrap: 'wrap' }}>
              {latestResult && (
                <div style={{
                  background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(233,124,48,0.2)', borderRadius: 8,
                  padding: '1.25rem 1.5rem', minWidth: 280,
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Latest Result {getResultBadge(latestResult)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>
                    {latestResult.home} <span style={{ color: 'var(--orange)', margin: '0 0.5rem' }}>{latestResult.score}</span> {latestResult.away}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: '0.25rem' }}>{latestResult.date}</div>
                </div>
              )}
              {nextFixture && (
                <div style={{
                  background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(233,124,48,0.2)', borderRadius: 8,
                  padding: '1.25rem 1.5rem', minWidth: 280,
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                    Next Fixture
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>
                    {nextFixture.home} <span style={{ color: 'var(--gray)', margin: '0 0.5rem' }}>vs</span> {nextFixture.away}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: '0.25rem' }}>{nextFixture.date} · {nextFixture.venue}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* League position */}
      {top3.length > 0 && (
        <section style={{ padding: '4rem 0', background: 'var(--dark)' }}>
          <div className="container">
            <h2 className="section-title">LEAGUE <span>STANDINGS</span></h2>
            <p className="section-subtitle">Top of the table</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {top3.map((team, i) => {
                const isFoxes = team.team?.toLowerCase().includes('foxes') || team.team?.toLowerCase().includes('streatham')
                return (
                  <div key={i} className="card" style={{
                    padding: '1.5rem',
                    border: isFoxes ? '1px solid var(--orange)' : undefined,
                    background: isFoxes ? 'rgba(233,124,48,0.08)' : undefined,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontFamily: 'Poppins', fontSize: '3rem', color: isFoxes ? 'var(--orange)' : 'rgba(255,255,255,0.15)', lineHeight: 1 }}>{i + 1}</span>
                      {isFoxes && <span style={{ fontSize: '0.75rem', color: 'var(--orange)', background: 'rgba(233,124,48,0.15)', padding: '0.2rem 0.5rem', borderRadius: 3 }}>OUR TEAM</span>}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{team.team}</div>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--gray)', fontSize: '0.8rem' }}>
                      <span>P: {team.played}</span>
                      <span style={{ color: 'var(--orange)', fontWeight: 700 }}>Pts: {team.points}</span>
                      <span>GD: {team.gd}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <Link to="/table" className="btn btn-outline">Full Table <ChevronRight size={16} /></Link>
          </div>
        </section>
      )}

      {/* Latest news */}
      {latestPosts.length > 0 && (
        <section style={{ padding: '4rem 0' }}>
          <div className="container">
            <h2 className="section-title">LATEST <span>NEWS</span></h2>
            <p className="section-subtitle">Club updates & announcements</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {latestPosts.map(post => (
                <Link to={`/news/${post.id}`} key={post.id} className="card" style={{ display: 'block' }}>
                  {post.image_url && (
                    <div style={{ height: 180, overflow: 'hidden' }}>
                      <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--orange)', marginBottom: '0.5rem' }}>
                      {format(parseISO(post.created_at), 'dd MMM yyyy')}
                    </div>
                    <h3 style={{ fontFamily: 'Poppins', fontSize: '1.3rem', marginBottom: '0.5rem' }}>{post.title}</h3>
                    <p style={{ color: 'var(--gray)', fontSize: '0.85rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.content}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/news" className="btn btn-outline"><Newspaper size={16} /> All News</Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{
        padding: '5rem 0',
        background: 'linear-gradient(135deg, rgba(233,124,48,0.15) 0%, rgba(233,124,48,0.05) 100%)',
        borderTop: '1px solid rgba(233,124,48,0.2)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Poppins', fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '1rem' }}>
            GET INVOLVED WITH<br /><span style={{ color: 'var(--orange)' }}>THE FOXES</span>
          </h2>
          <p style={{ color: 'var(--gray)', maxWidth: 500, margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Want to get in touch about the team? Whether you're a parent, player or supporter, we'd love to hear from you.
          </p>
          <Link to="/contact" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
            Contact Us <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
