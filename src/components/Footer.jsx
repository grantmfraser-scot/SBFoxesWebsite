import { Link } from 'react-router-dom'
import { FoxLogo } from './Navbar'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--dark)',
      borderTop: '1px solid rgba(255,102,0,0.2)',
      padding: '3rem 0 1.5rem',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <FoxLogo size={36} />
              <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: 'var(--orange)' }}>S&B Foxes Colts FC</span>
            </div>
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              Streatham & Balham Foxes Colts FC — developing the next generation of football talent in South London.
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--orange)' }}>Quick Links</h4>
            {[['/', 'Home'], ['/fixtures', 'Fixtures & Results'], ['/table', 'League Table'], ['/gallery', 'Gallery'], ['/news', 'News'], ['/contact', 'Contact']].map(([to, label]) => (
              <Link key={to} to={to} style={{ display: 'block', color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--orange)'}
                onMouseLeave={e => e.target.style.color = 'var(--gray)'}
              >{label}</Link>
            ))}
          </div>

          <div>
            <h4 style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--orange)' }}>The Club</h4>
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              Playing in the South London Youth Football League.<br />
              Home ground: Tooting Bec Common<br />
              London, SW17
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--orange)' }}>Social Media</h4>
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1rem' }}>Social feeds coming soon!</p>
            <Link to="/contact" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Get In Touch</Link>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Streatham & Balham Foxes Colts FC. All rights reserved.
          </p>
          <Link to="/admin" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--orange)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}
          >Admin</Link>
        </div>
      </div>
    </footer>
  )
}
