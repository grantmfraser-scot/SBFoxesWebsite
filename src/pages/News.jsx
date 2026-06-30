import { Link } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { format, parseISO } from 'date-fns'

export default function News() {
  const { data: posts, loading } = useApi('/api/posts')

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(255,102,0,0.15) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,102,0,0.2)',
        padding: '3rem 0 2rem',
      }}>
        <div className="container">
          <h1 className="section-title">CLUB <span>NEWS</span></h1>
          <p className="section-subtitle">Latest from the Foxes</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        )}

        {!loading && (!posts || posts.length === 0) && (
          <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--gray)' }}>
            <Newspaper size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No news posts yet</p>
            <p style={{ fontSize: '0.85rem' }}>Check back soon for club updates!</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {posts?.map(post => (
            <Link to={`/news/${post.id}`} key={post.id} className="card" style={{ display: 'block' }}>
              {post.image_url && (
                <div style={{ height: 200, overflow: 'hidden' }}>
                  <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--orange)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {format(parseISO(post.created_at), 'EEEE dd MMMM yyyy')}
                </div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', marginBottom: '0.75rem', lineHeight: 1.1 }}>{post.title}</h2>
                <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.content}
                </p>
                <div style={{ marginTop: '1rem', color: 'var(--orange)', fontSize: '0.8rem', fontWeight: 700 }}>Read more →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
