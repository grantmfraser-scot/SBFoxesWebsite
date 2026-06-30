import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import multer from 'multer'
import cron from 'node-cron'
import db from './db.js'
import { getFixturesAndResults, getLeagueTable } from './faProxy.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'data', 'uploads')))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'data', 'uploads')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
  }
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

// Simple auth middleware
function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token']
  const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password')
  if (!setting || token !== setting.value) {
    return res.status(401).json({ error: 'Unauthorised' })
  }
  next()
}

// ── FA data ──────────────────────────────────────────────────────────────────
app.get('/api/fixtures', async (req, res) => {
  try {
    const data = await getFixturesAndResults()
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/table', async (req, res) => {
  try {
    const data = await getLeagueTable()
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Posts ─────────────────────────────────────────────────────────────────────
app.get('/api/posts', (req, res) => {
  const posts = db.prepare('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC').all()
  res.json(posts)
})

app.get('/api/posts/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: 'Not found' })
  res.json(post)
})

app.post('/api/admin/posts', requireAuth, upload.single('image'), (req, res) => {
  const { title, content, published = 1 } = req.body
  const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null
  const result = db.prepare('INSERT INTO posts (title, content, image_url, published) VALUES (?, ?, ?, ?)').run(title, content, image_url, published)
  res.json({ id: result.lastInsertRowid })
})

app.put('/api/admin/posts/:id', requireAuth, upload.single('image'), (req, res) => {
  const { title, content, published } = req.body
  const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url
  db.prepare('UPDATE posts SET title=?, content=?, image_url=?, published=? WHERE id=?').run(title, content, image_url, published, req.params.id)
  res.json({ ok: true })
})

app.delete('/api/admin/posts/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// ── Gallery ───────────────────────────────────────────────────────────────────
app.get('/api/gallery', (req, res) => {
  const items = db.prepare('SELECT * FROM gallery ORDER BY created_at DESC').all()
  res.json(items)
})

app.post('/api/admin/gallery', requireAuth, upload.single('image'), (req, res) => {
  const { caption } = req.body
  const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url
  if (!image_url) return res.status(400).json({ error: 'Image required' })
  const result = db.prepare('INSERT INTO gallery (caption, image_url) VALUES (?, ?)').run(caption || '', image_url)
  res.json({ id: result.lastInsertRowid })
})

app.delete('/api/admin/gallery/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// ── Contact ───────────────────────────────────────────────────────────────────
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' })
  const result = db.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)').run(name, email, message)
  res.json({ id: result.lastInsertRowid })
})

app.get('/api/admin/contacts', requireAuth, (req, res) => {
  const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all()
  res.json(contacts)
})

app.put('/api/admin/contacts/:id/read', requireAuth, (req, res) => {
  db.prepare('UPDATE contacts SET read = 1 WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// ── Admin auth ────────────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body
  const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password')
  if (setting && password === setting.value) {
    res.json({ token: password })
  } else {
    res.status(401).json({ error: 'Invalid password' })
  }
})

app.get('/api/admin/all-posts', requireAuth, (req, res) => {
  const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all()
  res.json(posts)
})

// Refresh FA data every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    await getFixturesAndResults()
    await getLeagueTable()
    console.log('[cron] FA data refreshed')
  } catch (e) {
    console.error('[cron] FA refresh failed:', e.message)
  }
})

app.listen(PORT, () => {
  console.log(`🦊 SB Foxes API running on http://localhost:${PORT}`)
})
