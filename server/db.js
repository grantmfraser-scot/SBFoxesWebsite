import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// ---------------------------------------------------------------------------
// Pure-JavaScript, zero-dependency data store.
//
// Replaces better-sqlite3 so the project runs on any machine with Node — no
// C++ compiler / Xcode Command Line Tools required. It persists to a plain
// JSON file and exposes the same `db.prepare(sql).run/get/all(...)` surface
// that the rest of the server already uses, so no other file needs changing.
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
const dbPath = path.join(dataDir, 'foxes.json')
fs.mkdirSync(dataDir, { recursive: true })

const empty = () => ({
  posts: [],
  gallery: [],
  contacts: [],
  settings: [],
  _seq: { posts: 0, gallery: 0, contacts: 0 },
})

let store
try {
  store = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
  for (const [k, v] of Object.entries(empty())) if (!(k in store)) store[k] = v
} catch {
  store = empty()
}

const persist = () => fs.writeFileSync(dbPath, JSON.stringify(store, null, 2))
const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19)
const norm = (sql) => sql.replace(/\s+/g, ' ').trim()

function prepare(rawSql) {
  const sql = norm(rawSql)

  return {
    // INSERT / UPDATE / DELETE
    run(...params) {
      let m

      if ((m = sql.match(/^INSERT INTO (\w+) \(([^)]+)\) VALUES/i))) {
        const table = m[1]
        const cols = m[2].split(',').map((c) => c.trim())
        const row = {}
        cols.forEach((c, i) => (row[c] = params[i]))
        if (table in store._seq) row.id = ++store._seq[table]
        if (!('created_at' in row)) row.created_at = now()
        if (table === 'contacts' && row.read === undefined) row.read = 0
        store[table].push(row)
        persist()
        return { lastInsertRowid: row.id, changes: 1 }
      }

      if ((m = sql.match(/^UPDATE (\w+) SET (.+?) WHERE (\w+)\s*=\s*\?$/i))) {
        const [, table, setClause, whereCol] = m
        const assigns = setClause.split(',').map((a) => a.trim())
        const whereVal = params[params.length - 1]
        let changes = 0
        for (const row of store[table]) {
          if (String(row[whereCol]) !== String(whereVal)) continue
          let p = 0
          for (const a of assigns) {
            const [col, val] = a.split('=').map((s) => s.trim())
            row[col] = val === '?' ? params[p++] : isNaN(Number(val)) ? val : Number(val)
          }
          changes++
        }
        persist()
        return { changes }
      }

      if ((m = sql.match(/^DELETE FROM (\w+) WHERE (\w+)\s*=\s*\?$/i))) {
        const [, table, whereCol] = m
        const before = store[table].length
        store[table] = store[table].filter((r) => String(r[whereCol]) !== String(params[0]))
        persist()
        return { changes: before - store[table].length }
      }

      throw new Error('Unsupported run() statement: ' + sql)
    },

    // SELECT ... single row
    get(...params) {
      return runSelect(sql, params)[0]
    },

    // SELECT ... all rows
    all(...params) {
      return runSelect(sql, params)
    },
  }
}

function runSelect(sql, params) {
  const m = sql.match(/^SELECT (.+?) FROM (\w+)(?: WHERE (.+?))?(?: ORDER BY (\w+) (ASC|DESC))?$/i)
  if (!m) throw new Error('Unsupported select statement: ' + sql)
  const [, fields, table, where, orderCol, orderDir] = m

  let rows = [...(store[table] || [])]

  if (where) {
    // Supports "col = ?" and "col = <literal>", optionally joined by AND.
    // Resolve each condition's expected value once (binding ? params in order),
    // then filter — so param indexes don't drift across rows.
    let p = 0
    const conds = where.split(/\s+AND\s+/i).map((cond) => {
      const [col, rawVal] = cond.split('=').map((s) => s.trim())
      const expected = rawVal === '?' ? params[p++] : rawVal.replace(/^['"]|['"]$/g, '')
      return { col, expected }
    })
    rows = rows.filter((row) =>
      conds.every(({ col, expected }) => String(row[col]) === String(expected))
    )
  }

  if (orderCol) {
    rows.sort((a, b) => {
      const av = a[orderCol], bv = b[orderCol]
      return av < bv ? -1 : av > bv ? 1 : 0
    })
    if (orderDir && orderDir.toUpperCase() === 'DESC') rows.reverse()
  }

  // Projection: only "SELECT value FROM settings" needs narrowing; "*" returns full rows.
  if (fields.trim() !== '*') {
    const wanted = fields.split(',').map((f) => f.trim())
    rows = rows.map((r) => Object.fromEntries(wanted.map((w) => [w, r[w]])))
  }

  return rows
}

const db = { prepare }

// Seed default admin password (mirrors previous behaviour).
const adminPass = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password')
if (!adminPass) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('admin_password', 'foxes2024')
}

export default db
