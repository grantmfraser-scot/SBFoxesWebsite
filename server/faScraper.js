// Live FA Full-Time data via a real headless browser.
//
// Plain HTTP fetches don't work: FA Full-Time is a JavaScript app (the data
// isn't in the initial HTML) and it blocks scrapers. So we drive a real
// Chromium browser (Playwright) that renders the page exactly like a person's
// browser would, then read the data out of the rendered DOM.
//
// Order of preference when the site asks for data:
//   1. Manual data entered in the admin panel (if the admin enabled it)
//   2. Live data scraped from FA Full-Time (cached)
//   3. Sample data (so the site never looks broken)
//
// Requires Chromium: `npm run fa:install` once on the machine that runs this.

import * as cheerio from 'cheerio'
import db from './db.js'
import { faUrl, FA } from './faConfig.js'

const CACHE_TTL = 15 * 60 * 1000 // 15 min
let cache = { fixtures: null, results: null, table: null, lastFetch: 0, error: null }

// ── settings helpers (manual override lives in the DB) ──────────────────────
function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
  return row ? row.value : null
}
function getManual() {
  if (getSetting('fa_manual_enabled') !== '1') return null
  try {
    return {
      fixtures: JSON.parse(getSetting('fa_manual_fixtures') || '[]'),
      results: JSON.parse(getSetting('fa_manual_results') || '[]'),
      table: JSON.parse(getSetting('fa_manual_table') || '[]'),
    }
  } catch {
    return null
  }
}

// ── headless browser render ─────────────────────────────────────────────────
async function renderHtml() {
  let chromium
  try {
    ;({ chromium } = await import('playwright'))
  } catch {
    throw new Error('Playwright not installed — run `npm install` then `npm run fa:install`')
  }

  const browser = await chromium.launch({ headless: true })
  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-GB',
      viewport: { width: 1280, height: 2000 },
    })
    const page = await context.newPage()
    await page.goto(faUrl(), { waitUntil: 'networkidle', timeout: 60000 })
    try {
      await page.waitForSelector('table', { timeout: 20000 })
    } catch {
      /* fall through and parse whatever rendered */
    }
    await page.waitForTimeout(1500)
    return await page.content()
  } finally {
    await browser.close()
  }
}

// ── parsing ─────────────────────────────────────────────────────────────────
// NOTE: these are best-effort generic parsers for standard rendered tables.
// Once we capture your league's real page (npm run fa:capture) they can be
// tightened to its exact column layout.

function num(s) {
  return /^-?\d+$/.test((s || '').trim())
}

function parseTable(html) {
  const $ = cheerio.load(html)
  const table = []

  $('table').each((_, t) => {
    const headers = $(t)
      .find('th')
      .map((_, th) => $(th).text().trim().toLowerCase())
      .get()
    const looksLikeStandings =
      headers.some(h => /^(pts|points)$/.test(h)) &&
      headers.some(h => /^(p|pld|played)$/.test(h))
    if (!looksLikeStandings) return

    $(t)
      .find('tbody tr')
      .each((ri, row) => {
        const cells = $(row).find('td').map((_, td) => $(td).text().trim()).get()
        if (cells.length < 6) return
        const team = cells.find(c => /[a-zA-Z]{3,}/.test(c) && !num(c))
        if (!team) return
        const nums = cells.filter(num)
        table.push({
          position: table.length + 1,
          team,
          played: nums[0] || '0',
          won: nums[1] || '0',
          drawn: nums[2] || '0',
          lost: nums[3] || '0',
          gf: nums[4] || '0',
          ga: nums[5] || '0',
          gd: nums[6] ?? '0',
          points: nums[nums.length - 1] || '0',
        })
      })
  })

  return table
}

function parseFixturesResults(html) {
  const $ = cheerio.load(html)
  const fixtures = []
  const results = []

  $('table').each((_, t) => {
    const headers = $(t)
      .find('th')
      .map((_, th) => $(th).text().trim().toLowerCase())
      .get()
    // Skip the standings table; we want date/home/away style tables.
    if (headers.some(h => /^(pts|points)$/.test(h))) return

    $(t)
      .find('tbody tr')
      .each((_, row) => {
        const cells = $(row).find('td').map((_, td) => $(td).text().trim()).get()
        if (cells.length < 3) return
        const dateCell = cells.find(c => /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(c))
        const scoreCell = cells.find(c => /\d+\s*[-–]\s*\d+/.test(c))
        const teams = cells.filter(c => /[a-zA-Z]{3,}/.test(c))
        const entry = {
          date: dateCell || cells[0] || '',
          home: teams[0] || '',
          away: teams[1] || '',
          venue: '',
          score: scoreCell || 'vs',
        }
        if (scoreCell) results.push(entry)
        else if (entry.home) fixtures.push(entry)
      })
  })

  return { fixtures, results }
}

async function refresh() {
  const html = await renderHtml()
  const table = parseTable(html)
  const { fixtures, results } = parseFixturesResults(html)
  if (!table.length && !fixtures.length && !results.length) {
    throw new Error('Rendered the page but found no recognisable fixtures/table — parser needs tuning (run npm run fa:capture)')
  }
  cache = { fixtures, results, table, lastFetch: Date.now(), error: null }
  return cache
}

async function ensureFresh() {
  if (cache.lastFetch && Date.now() - cache.lastFetch < CACHE_TTL) return
  try {
    await refresh()
  } catch (e) {
    cache.error = e.message
    console.error('FA scrape error:', e.message)
  }
}

// ── public API (same shape the rest of the server already expects) ───────────
export async function getFixturesAndResults() {
  const manual = getManual()
  if (manual) {
    return { fixtures: manual.fixtures, results: manual.results, source: 'manual', lastUpdated: new Date().toISOString() }
  }
  await ensureFresh()
  if (cache.fixtures || cache.results) {
    return { fixtures: cache.fixtures || [], results: cache.results || [], source: 'fa-live', lastUpdated: new Date(cache.lastFetch).toISOString() }
  }
  return { ...sampleFixtures(), source: 'sample', error: cache.error }
}

export async function getLeagueTable() {
  const manual = getManual()
  if (manual && manual.table.length) {
    return { table: manual.table, source: 'manual', lastUpdated: new Date().toISOString() }
  }
  await ensureFresh()
  if (cache.table && cache.table.length) {
    return { table: cache.table, source: 'fa-live', lastUpdated: new Date(cache.lastFetch).toISOString() }
  }
  return { ...sampleTable(), source: 'sample', error: cache.error }
}

export { FA }

// ── sample fallback ───────────────────────────────────────────────────────────
function sampleFixtures() {
  return {
    fixtures: [
      { date: '05/07/2025', home: 'Streatham & Balham Foxes Colts', away: 'Brixton FC Youth', venue: 'Tooting Bec Common', score: 'vs' },
      { date: '12/07/2025', home: 'Balham Athletic U12', away: 'Streatham & Balham Foxes Colts', venue: 'Away', score: 'vs' },
      { date: '19/07/2025', home: 'Streatham & Balham Foxes Colts', away: 'Wandsworth Juniors', venue: 'Tooting Bec Common', score: 'vs' },
    ],
    results: [
      { date: '14/06/2025', home: 'Streatham & Balham Foxes Colts', away: 'Clapham FC Youth', venue: 'Home', score: '3 - 1' },
      { date: '07/06/2025', home: 'Norwood FC U12', away: 'Streatham & Balham Foxes Colts', venue: 'Away', score: '0 - 2' },
      { date: '31/05/2025', home: 'Streatham & Balham Foxes Colts', away: 'Crystal Palace Academy', venue: 'Home', score: '2 - 2' },
    ],
    lastUpdated: new Date().toISOString(),
  }
}

function sampleTable() {
  return {
    table: [
      { position: 1, team: 'Norwood FC U12', played: '12', won: '9', drawn: '2', lost: '1', gf: '34', ga: '10', gd: '+24', points: '29' },
      { position: 2, team: 'Streatham & Balham Foxes Colts', played: '12', won: '8', drawn: '2', lost: '2', gf: '28', ga: '12', gd: '+16', points: '26' },
      { position: 3, team: 'Brixton FC Youth', played: '12', won: '7', drawn: '1', lost: '4', gf: '22', ga: '18', gd: '+4', points: '22' },
      { position: 4, team: 'Balham Athletic U12', played: '12', won: '6', drawn: '2', lost: '4', gf: '20', ga: '17', gd: '+3', points: '20' },
      { position: 5, team: 'Wandsworth Juniors', played: '12', won: '5', drawn: '3', lost: '4', gf: '18', ga: '20', gd: '-2', points: '18' },
      { position: 6, team: 'Clapham FC Youth', played: '12', won: '4', drawn: '2', lost: '6', gf: '16', ga: '24', gd: '-8', points: '14' },
    ],
    lastUpdated: new Date().toISOString(),
  }
}
