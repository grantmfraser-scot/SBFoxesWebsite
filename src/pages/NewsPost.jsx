import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { format, parseISO } from 'date-fns'

export default function NewsPost() {
  const { id } = useParams()
  const { data: post, loading } = useApi(`/api/posts/${id}`, [id])

  if (loading) return (
    <div style={{ paddingTop: 100, display: 'flex', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  )

  if (!post) return (
    <div style={{ paddingTop: 100, textAlign: 'center', color: 'var(--gray)' }}>
      <p>Post not found.</p>
      <Link to="/news" style={{ color: 'var(--orange)', marginTop: '1rem', display: 'inline-block' }}>← Back to News</Link>
    </div>
  )

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      {post.image_url && (
        <div style={{ height: 'clamp(200px, 40vh, 400px)', overflow: 'hidden', position: 'relative' }}>
          <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, var(--black))' }} />
        </div>
      )}

      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: 800 }}>
        <Link to="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--orange)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Back to News
        </Link>

        <div style={{ fontSize: '0.8rem', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          {format(parseISO(post.created_at), 'EEEE dd MMMM yyyy')}
        </div>

        <h1 style={{ fontFamily: 'Poppins', fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '2rem', lineHeight: 1 }}>
          {post.title}
        </h1>

        <div style={{
          color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, fontSize: '1rem',
          whiteSpace: 'pre-wrap',
        }}>
          {post.content}
        </div>
      </div>
    </div>
  )
}
