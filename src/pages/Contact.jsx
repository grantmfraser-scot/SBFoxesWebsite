import { useState } from 'react'
import { Send, CheckCircle, MapPin, Mail } from 'lucide-react'
import axios from 'axios'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      await axios.post('/api/contact', form)
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.85rem 1rem', borderRadius: 6,
    background: 'var(--dark2)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', fontSize: '0.95rem', outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(255,102,0,0.15) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,102,0,0.2)',
        padding: '3rem 0 2rem',
      }}>
        <div className="container">
          <h1 className="section-title">GET IN <span>TOUCH</span></h1>
          <p className="section-subtitle">We'd love to hear from you</p>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

          {/* Info panel */}
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              STREATHAM &amp; BALHAM<br /><span style={{ color: 'var(--orange)' }}>FOXES COLTS FC</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,102,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} style={{ color: 'var(--orange)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Home Ground</div>
                  <div style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: 1.6 }}>Tooting Bec Common<br />London, SW17</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,102,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={18} style={{ color: 'var(--orange)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Email Us</div>
                  <div style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Use the form to get in touch</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--dark2)', borderRadius: 8, border: '1px solid rgba(255,102,0,0.15)' }}>
              <p style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                Whether you're a parent interested in joining, a local business wanting to sponsor the team, or just a supporter — we'd love to hear from you!
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            {status === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 8 }}>
                <CheckCircle size={48} style={{ color: '#4caf50', margin: '0 auto 1rem' }} />
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Message Sent!</h3>
                <p style={{ color: 'var(--gray)' }}>We'll get back to you as soon as possible.</p>
                <button className="btn btn-outline" style={{ marginTop: '1.5rem' }} onClick={() => setStatus('idle')}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray)', marginBottom: '0.4rem' }}>
                    Your Name *
                  </label>
                  <input required value={form.name} onChange={update('name')} placeholder="John Smith" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray)', marginBottom: '0.4rem' }}>
                    Email Address *
                  </label>
                  <input required type="email" value={form.email} onChange={update('email')} placeholder="john@example.com" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray)', marginBottom: '0.4rem' }}>
                    Message *
                  </label>
                  <textarea required rows={6} value={form.message} onChange={update('message')} placeholder="Tell us how we can help..." style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {status === 'error' && (
                  <div style={{ padding: '0.75rem', background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: 6, color: '#f44336', fontSize: '0.85rem' }}>
                    Something went wrong. Please try again.
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={status === 'sending'} style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}>
                  {status === 'sending' ? 'Sending...' : <><Send size={16} /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
