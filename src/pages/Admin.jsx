import { useState, useRef } from 'react'
import { LogIn, LogOut, Plus, Trash2, Edit2, Image, FileText, Mail, Eye, EyeOff, CheckCircle, X } from 'lucide-react'
import axios from 'axios'
import { useApi, adminToken, authHeaders } from '../hooks/useApi'
import { format, parseISO } from 'date-fns'

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await axios.post('/api/admin/login', { password })
      adminToken.set(data.token)
      onLogin()
    } catch {
      setError('Invalid password')
    }
  }

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--dark2)', border: '1px solid rgba(255,102,0,0.2)', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 380 }}>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', marginBottom: '0.25rem' }}>Admin <span style={{ color: 'var(--orange)' }}>Login</span></h1>
        <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '2rem' }}>Streatham & Balham Foxes Colts FC</p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Admin password" autoFocus required
            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 6, background: 'var(--dark)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.95rem' }}
          />
          {error && <p style={{ color: '#f44336', fontSize: '0.85rem' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <LogIn size={16} /> Sign In
          </button>
        </form>

        <p style={{ color: 'var(--gray)', fontSize: '0.75rem', marginTop: '1.5rem', textAlign: 'center' }}>
          Default password: <code style={{ color: 'var(--orange)' }}>foxes2024</code>
        </p>
      </div>
    </div>
  )
}

// ─── Post Editor ──────────────────────────────────────────────────────────────
function PostEditor({ post, onSave, onCancel }) {
  const [form, setForm] = useState({ title: post?.title || '', content: post?.content || '', published: post?.published ?? 1 })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  async function save() {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)
      else if (post?.image_url) fd.append('image_url', post.image_url)

      if (post?.id) {
        await axios.put(`/api/admin/posts/${post.id}`, fd, { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } })
      } else {
        await axios.post('/api/admin/posts', fd, { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } })
      }
      onSave()
    } catch (e) {
      alert('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: 6, background: 'var(--dark)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }

  return (
    <div style={{ background: 'var(--dark2)', border: '1px solid rgba(255,102,0,0.2)', borderRadius: 8, padding: '1.5rem', marginBottom: '1rem' }}>
      <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', marginBottom: '1rem' }}>{post?.id ? 'Edit Post' : 'New Post'}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
        <textarea placeholder="Content *" rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} />
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gray)', marginBottom: '0.4rem' }}>Image (optional)</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ color: 'var(--gray)', fontSize: '0.85rem' }} />
          {post?.image_url && !imageFile && <img src={post.image_url} alt="" style={{ marginTop: '0.5rem', height: 80, borderRadius: 4, objectFit: 'cover' }} />}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
          <input type="checkbox" checked={form.published === 1} onChange={e => setForm(f => ({ ...f, published: e.target.checked ? 1 : 0 }))} />
          Published
        </label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Post'}</button>
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Gallery Uploader ─────────────────────────────────────────────────────────
function GalleryUploader({ onDone }) {
  const [files, setFiles] = useState([])
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)

  async function upload() {
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('caption', caption)
      await axios.post('/api/admin/gallery', fd, { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } })
    }
    setUploading(false)
    setFiles([])
    setCaption('')
    onDone()
  }

  return (
    <div style={{ background: 'var(--dark2)', border: '1px solid rgba(255,102,0,0.2)', borderRadius: 8, padding: '1.5rem', marginBottom: '1rem' }}>
      <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', marginBottom: '1rem' }}>Upload Photos</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files))} style={{ color: 'var(--gray)' }} />
        {files.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {files.map((f, i) => (
              <img key={i} src={URL.createObjectURL(f)} alt="" style={{ height: 60, width: 80, objectFit: 'cover', borderRadius: 4 }} />
            ))}
          </div>
        )}
        <input placeholder="Caption (optional)" value={caption} onChange={e => setCaption(e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: 6, background: 'var(--dark)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={upload} disabled={uploading || files.length === 0}>{uploading ? 'Uploading...' : `Upload ${files.length} Photo${files.length !== 1 ? 's' : ''}`}</button>
          <button className="btn btn-outline" onClick={onDone}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Admin ───────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(!!adminToken.get())
  const [tab, setTab] = useState('posts')
  const [editingPost, setEditingPost] = useState(null) // null | 'new' | post
  const [showGalleryUpload, setShowGalleryUpload] = useState(false)
  const [tick, setTick] = useState(0)
  const refresh = () => setTick(t => t + 1)

  const { data: posts } = useApi('/api/admin/all-posts', [tick, authed])
  const { data: gallery } = useApi('/api/gallery', [tick, authed])
  const { data: contacts } = useApi('/api/admin/contacts', [tick, authed])

  function logout() {
    adminToken.clear()
    setAuthed(false)
  }

  async function deletePost(id) {
    if (!confirm('Delete this post?')) return
    await axios.delete(`/api/admin/posts/${id}`, { headers: authHeaders() })
    refresh()
  }

  async function deleteGallery(id) {
    if (!confirm('Delete this photo?')) return
    await axios.delete(`/api/admin/gallery/${id}`, { headers: authHeaders() })
    refresh()
  }

  async function markRead(id) {
    await axios.put(`/api/admin/contacts/${id}/read`, {}, { headers: authHeaders() })
    refresh()
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />

  const tabs = [
    { key: 'posts', label: 'News Posts', icon: <FileText size={16} /> },
    { key: 'gallery', label: 'Gallery', icon: <Image size={16} /> },
    { key: 'contacts', label: `Messages ${contacts?.filter(c => !c.read).length ? `(${contacts.filter(c => !c.read).length})` : ''}`, icon: <Mail size={16} /> },
  ]

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      {/* Admin header */}
      <div style={{ background: 'var(--dark)', borderBottom: '1px solid rgba(255,102,0,0.2)', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem' }}>Admin <span style={{ color: 'var(--orange)' }}>Dashboard</span></h1>
            <p style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>Streatham & Balham Foxes Colts FC</p>
          </div>
          <button onClick={logout} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1.25rem', borderRadius: '6px 6px 0 0', border: 'none',
              background: tab === t.key ? 'rgba(255,102,0,0.15)' : 'transparent',
              color: tab === t.key ? 'var(--orange)' : 'var(--gray)',
              fontWeight: 700, fontSize: '0.85rem',
              borderBottom: tab === t.key ? '2px solid var(--orange)' : '2px solid transparent',
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {/* Posts tab */}
        {tab === 'posts' && (
          <div>
            {editingPost ? (
              <PostEditor
                post={editingPost === 'new' ? null : editingPost}
                onSave={() => { setEditingPost(null); refresh() }}
                onCancel={() => setEditingPost(null)}
              />
            ) : (
              <>
                <button className="btn btn-primary" style={{ marginBottom: '1.5rem' }} onClick={() => setEditingPost('new')}>
                  <Plus size={16} /> New Post
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {posts?.map(post => (
                    <div key={post.id} style={{ background: 'var(--dark2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {post.image_url && <img src={post.image_url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{post.title}</span>
                          {!post.published && <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--gray)' }}>Draft</span>}
                        </div>
                        <div style={{ color: 'var(--gray)', fontSize: '0.78rem' }}>
                          {format(parseISO(post.created_at), 'dd MMM yyyy')} · {post.content.slice(0, 80)}...
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button onClick={() => setEditingPost(post)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: 4, cursor: 'pointer' }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deletePost(post.id)} style={{ background: 'rgba(244,67,54,0.1)', border: 'none', color: '#f44336', padding: '0.5rem', borderRadius: 4, cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {posts?.length === 0 && <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '2rem' }}>No posts yet. Create your first one!</p>}
                </div>
              </>
            )}
          </div>
        )}

        {/* Gallery tab */}
        {tab === 'gallery' && (
          <div>
            {showGalleryUpload ? (
              <GalleryUploader onDone={() => { setShowGalleryUpload(false); refresh() }} />
            ) : (
              <button className="btn btn-primary" style={{ marginBottom: '1.5rem' }} onClick={() => setShowGalleryUpload(true)}>
                <Plus size={16} /> Upload Photos
              </button>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {gallery?.map(item => (
                <div key={item.id} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', aspectRatio: '1' }}>
                  <img src={item.image_url} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => deleteGallery(item.id)} style={{
                    position: 'absolute', top: '0.4rem', right: '0.4rem',
                    background: 'rgba(0,0,0,0.7)', border: 'none', color: '#f44336',
                    borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}>
                    <X size={14} />
                  </button>
                  {item.caption && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '0.3rem 0.5rem', fontSize: '0.7rem', color: 'white' }}>{item.caption}</div>}
                </div>
              ))}
            </div>
            {gallery?.length === 0 && <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '2rem' }}>No photos yet.</p>}
          </div>
        )}

        {/* Contacts tab */}
        {tab === 'contacts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {contacts?.map(c => (
              <div key={c.id} style={{
                background: 'var(--dark2)', border: `1px solid ${c.read ? 'rgba(255,255,255,0.06)' : 'rgba(255,102,0,0.3)'}`,
                borderRadius: 8, padding: '1.25rem',
                opacity: c.read ? 0.7 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{c.name}</span>
                    <span style={{ color: 'var(--gray)', fontSize: '0.85rem', marginLeft: '0.75rem' }}>{c.email}</span>
                    {!c.read && <span className="badge badge-upcoming" style={{ marginLeft: '0.5rem' }}>New</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'var(--gray)', fontSize: '0.75rem' }}>{format(parseISO(c.created_at), 'dd MMM yyyy HH:mm')}</span>
                    {!c.read && (
                      <button onClick={() => markRead(c.id)} style={{ background: 'rgba(76,175,80,0.15)', border: 'none', color: '#4caf50', padding: '0.3rem 0.6rem', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle size={12} /> Mark read
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.message}</p>
              </div>
            ))}
            {contacts?.length === 0 && <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '2rem' }}>No messages yet.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
