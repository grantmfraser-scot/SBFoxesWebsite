import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/fixtures', label: 'Fixtures' },
  { to: '/table', label: 'Table' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => setOpen(false), [location])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(14,29,51,0.97)' : 'rgba(14,29,51,0.7)',
      backdropFilter: 'blur(12px)',
      borderBottom: scrolled ? '1px solid rgba(233,124,48,0.3)' : '1px solid transparent',
      transition: 'all 0.3s',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FoxLogo size={42} />
          <div>
            <div style={{ fontFamily: 'Poppins', fontSize: '1.25rem', letterSpacing: '0.05em', lineHeight: 1 }}>
              <span style={{ color: 'var(--orange)' }}>S&B</span> Foxes Colts
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--gray)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Streatham & Balham FC
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '0.4rem 0.9rem',
              borderRadius: 4,
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: location.pathname === l.to ? 'var(--orange)' : 'rgba(255,255,255,0.8)',
              background: location.pathname === l.to ? 'rgba(233,124,48,0.12)' : 'transparent',
              transition: 'all 0.2s',
            }}>{l.label}</Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: 'white', padding: '0.5rem' }} className="mobile-toggle">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: 'rgba(14,29,51,0.98)',
          borderTop: '1px solid rgba(233,124,48,0.2)',
          padding: '1rem 1.5rem',
        }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              display: 'block',
              padding: '0.75rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: '1rem',
              fontWeight: 600,
              color: location.pathname === l.to ? 'var(--orange)' : 'white',
              letterSpacing: '0.05em',
            }}>{l.label}</Link>
          ))}
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-toggle { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}

export function FoxLogo({ size = 40 }) {
  const [imgOk, setImgOk] = useState(true)
  if (imgOk) {
    return (
      <img
        src="/images/badge.png"
        alt="Streatham & Balham Foxes Colts FC badge"
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
        onError={() => setImgOk(false)}
      />
    )
  }
  // Fallback crest, shown until the real badge is saved to public/images/badge.png
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="var(--orange)" />
      <circle cx="50" cy="50" r="44" fill="var(--dark)" />
      {/* Fox face */}
      <path d="M50 20 L30 35 L20 25 L28 50 L20 55 L50 80 L80 55 L72 50 L80 25 L70 35 Z" fill="var(--orange)" />
      <path d="M50 30 L38 42 L50 55 L62 42 Z" fill="#1a1a1a" />
      <circle cx="40" cy="46" r="4" fill="white" />
      <circle cx="60" cy="46" r="4" fill="white" />
      <circle cx="41" cy="47" r="2" fill="#0D0D0D" />
      <circle cx="61" cy="47" r="2" fill="#0D0D0D" />
      <path d="M44 62 Q50 67 56 62" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}
