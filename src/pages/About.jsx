import { Link } from 'react-router-dom'
import { Trophy, Users, MapPin, Heart } from 'lucide-react'

export default function About() {
  return (
    <div style={{ paddingTop: 70 }}>
      {/* Hero with the fox photo */}
      <section style={{
        position: 'relative',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
      }}>
        <img
          src="/images/fox.jpg"
          alt="A fox in the South London sunshine"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            objectPosition: 'center 30%',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(14,29,51,0.35) 0%, rgba(14,29,51,0.85) 100%)',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: '3rem', paddingTop: '6rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(233,124,48,0.15)', border: '1px solid rgba(233,124,48,0.4)',
            borderRadius: 100, padding: '0.4rem 1rem', marginBottom: '1.25rem',
            fontSize: '0.8rem', color: 'var(--orange)', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <Heart size={12} /> Our Club
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', marginBottom: '1rem' }}>
            About the <span style={{ color: 'var(--orange)' }}>Foxes</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.15rem', maxWidth: 560, lineHeight: 1.7 }}>
            Fierce, fast and fearless — just like our namesake. Streatham &amp; Balham Foxes
            Colts FC is a grassroots youth club built on community, fun and a love of the game.
          </p>
        </div>
      </section>

      {/* Story + values */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto 3.5rem' }}>
          <h2 className="section-title">Who <span>we are</span></h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', lineHeight: 1.9, marginTop: '1.25rem' }}>
            We're a youth football team based in the heart of South London, giving young players
            the chance to develop their skills, make friends and enjoy competitive football in a
            supportive environment. From training nights to match days, everything we do is about
            helping our colts grow — on and off the pitch.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', lineHeight: 1.9, marginTop: '1rem' }}>
            Foxes are a common sight across Streatham and Balham, and our players carry that same
            spirit onto the field every week. Up the Foxes! 🦊
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: Users, title: 'Community First', text: 'A welcoming, family-friendly club rooted in South London.' },
            { icon: Trophy, title: 'Competitive Spirit', text: 'Playing to win, learning to grow, and having fun doing it.' },
            { icon: MapPin, title: 'Local & Proud', text: 'Based in Streatham & Balham, representing our patch.' },
            { icon: Heart, title: 'Player Development', text: 'Every colt matters — building skills and confidence.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="card" style={{ padding: '1.75rem' }}>
              <div style={{
                width: 46, height: 46, borderRadius: 10, marginBottom: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(233,124,48,0.15)', color: 'var(--orange)',
              }}>
                <Icon size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <Link to="/contact" className="btn btn-primary">Get In Touch</Link>
        </div>
      </section>
    </div>
  )
}
