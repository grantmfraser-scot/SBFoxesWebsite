import { useState } from 'react'
import { X, Image } from 'lucide-react'
import { useApi } from '../hooks/useApi'

export default function Gallery() {
  const { data: items, loading } = useApi('/api/gallery')
  const [lightbox, setLightbox] = useState(null)

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(255,102,0,0.15) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,102,0,0.2)',
        padding: '3rem 0 2rem',
      }}>
        <div className="container">
          <h1 className="section-title">PHOTO <span>GALLERY</span></h1>
          <p className="section-subtitle">Match photos and club memories</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        )}

        {!loading && (!items || items.length === 0) && (
          <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--gray)' }}>
            <Image size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No photos yet</p>
            <p style={{ fontSize: '0.85rem' }}>Photos will appear here once uploaded via the admin panel</p>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {items?.map((item, i) => (
            <div
              key={item.id}
              onClick={() => setLightbox(item)}
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
                aspectRatio: '4/3',
                position: 'relative',
                background: 'var(--dark2)',
              }}
            >
              <img
                src={item.image_url}
                alt={item.caption || 'Gallery photo'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
              {item.caption && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  padding: '2rem 1rem 0.75rem',
                  color: 'white', fontSize: '0.85rem', fontWeight: 600,
                }}>
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
              borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={lightbox.image_url} alt={lightbox.caption} style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} />
            {lightbox.caption && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--gray)' }}>{lightbox.caption}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
