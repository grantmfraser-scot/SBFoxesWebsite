import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

const BASE = 'https://fulltime.thefa.com'
const SEASON = '474917553'
const AGE_GROUP = '0'
const DIVISION = '929004628'
const COMPETITION = '0'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-GB,en;q=0.9',
  'Referer': 'https://fulltime.thefa.com/',
  'Cache-Control': 'no-cache',
}

let cache = { fixtures: null, table: null, lastFetch: 0 }
const CACHE_TTL = 10 * 60 * 1000 // 10 min

async function fetchFA(path) {
  const url = `${BASE}${path}`
  const res = await fetch(url, { headers: HEADERS, timeout: 15000 })
  if (!res.ok) throw new Error(`FA fetch failed: ${res.status} ${url}`)
  return res.text()
}

function parseFixtures(html) {
  const $ = cheerio.load(html)
  const fixtures = []

  // FA Fulltime fixtures table
  $('table.fixture-table tr, .fixtures-results tr, tr').each((_, row) => {
    const cells = $(row).find('td')
    if (cells.length < 3) return
    const texts = cells.map((_, c) => $(c).text().trim()).get()
    // Look for date-like patterns
    if (texts.some(t => /\d{2}\/\d{2}\/\d{4}/.test(t) || /\d{2}-\d{2}-\d{4}/.test(t))) {
      fixtures.push({ raw: texts })
    }
  })

  return fixtures
}

export async function getFixturesAndResults() {
  const now = Date.now()
  if (cache.fixtures && now - cache.lastFetch < CACHE_TTL) {
    return cache.fixtures
  }

  try {
    // Try the fixtures endpoint
    const params = `selectedSeason=${SEASON}&selectedFixtureGroupAgeGroup=${AGE_GROUP}&selectedDivision=${DIVISION}&selectedCompetition=${COMPETITION}`
    const html = await fetchFA(`/index.html?${params}`)
    const $ = cheerio.load(html)

    const fixtures = []
    const results = []

    // Parse fixture rows - FA Fulltime uses various class names
    const fixtureSelectors = [
      '.fixture-card', '.fixture-row', 'tr.fixture',
      '.upcoming-fixture', '[data-fixture]'
    ]

    // Generic table parsing
    $('table').each((ti, table) => {
      const headers = $(table).find('th').map((_, th) => $(th).text().trim().toLowerCase()).get()
      $(table).find('tbody tr').each((ri, row) => {
        const cells = $(row).find('td').map((_, td) => $(td).text().trim()).get()
        if (cells.length >= 3) {
          const entry = {}
          headers.forEach((h, i) => { entry[h] = cells[i] })
          if (!entry.home && cells.length >= 5) {
            entry.date = cells[0]
            entry.home = cells[1]
            entry.score = cells[2] || 'vs'
            entry.away = cells[3]
            entry.venue = cells[4] || ''
          }
          const hasScore = /\d+\s*[-–]\s*\d+/.test(entry.score || '')
          if (hasScore) results.push(entry)
          else if (entry.home || entry.date) fixtures.push(entry)
        }
      })
    })

    const data = { fixtures, results, lastUpdated: new Date().toISOString() }
    cache.fixtures = data
    cache.lastFetch = now
    return data
  } catch (err) {
    console.error('FA fixtures fetch error:', err.message)
    // Return cached data if available, else mock data
    if (cache.fixtures) return cache.fixtures
    return getMockFixtures()
  }
}

export async function getLeagueTable() {
  const now = Date.now()
  if (cache.table && now - cache.lastFetch < CACHE_TTL) {
    return cache.table
  }

  try {
    const params = `selectedSeason=${SEASON}&selectedFixtureGroupAgeGroup=${AGE_GROUP}&selectedDivision=${DIVISION}&selectedCompetition=${COMPETITION}`
    const html = await fetchFA(`/index.html?${params}`)
    const $ = cheerio.load(html)

    const table = []

    // Find the league table - look for tables with P W D L columns
    $('table').each((_, t) => {
      const headers = $(t).find('th').map((_, th) => $(th).text().trim()).get()
      const isPtsTable = headers.some(h => /^pts$/i.test(h) || /^points$/i.test(h))
      if (isPtsTable || headers.some(h => /^p$/i.test(h))) {
        $(t).find('tbody tr').each((ri, row) => {
          const cells = $(row).find('td').map((_, td) => $(td).text().trim()).get()
          if (cells.length >= 6) {
            table.push({
              position: ri + 1,
              team: cells.find(c => /[a-zA-Z]{3,}/.test(c) && !/^\d+$/.test(c)) || cells[1],
              played: cells.find(c => /^\d+$/.test(c)) || '0',
              won: cells[2] || '0',
              drawn: cells[3] || '0',
              lost: cells[4] || '0',
              gf: cells[5] || '0',
              ga: cells[6] || '0',
              gd: cells[7] || '0',
              points: cells[cells.length - 1] || '0',
            })
          }
        })
      }
    })

    if (table.length === 0) throw new Error('No table found')

    const data = { table, lastUpdated: new Date().toISOString() }
    cache.table = data
    cache.lastFetch = now
    return data
  } catch (err) {
    console.error('FA table fetch error:', err.message)
    if (cache.table) return cache.table
    return getMockTable()
  }
}

function getMockFixtures() {
  return {
    fixtures: [
      { date: '05/07/2025', home: 'Streatham & Balham Foxes Colts', score: 'vs', away: 'Brixton FC Youth', venue: 'Tooting Bec Common' },
      { date: '12/07/2025', home: 'Balham Athletic U12', score: 'vs', away: 'Streatham & Balham Foxes Colts', venue: 'Away' },
      { date: '19/07/2025', home: 'Streatham & Balham Foxes Colts', score: 'vs', away: 'Wandsworth Juniors', venue: 'Tooting Bec Common' },
    ],
    results: [
      { date: '14/06/2025', home: 'Streatham & Balham Foxes Colts', score: '3 - 1', away: 'Clapham FC Youth', venue: 'Home' },
      { date: '07/06/2025', home: 'Norwood FC U12', score: '0 - 2', away: 'Streatham & Balham Foxes Colts', venue: 'Away' },
      { date: '31/05/2025', home: 'Streatham & Balham Foxes Colts', score: '2 - 2', away: 'Crystal Palace Academy', venue: 'Home' },
    ],
    lastUpdated: new Date().toISOString(),
    isMock: true,
  }
}

function getMockTable() {
  return {
    table: [
      { position: 1, team: 'Norwood FC U12', played: '12', won: '9', drawn: '2', lost: '1', gf: '34', ga: '10', gd: '+24', points: '29' },
      { position: 2, team: 'Streatham & Balham Foxes Colts', played: '12', won: '8', drawn: '2', lost: '2', gf: '28', ga: '12', gd: '+16', points: '26' },
      { position: 3, team: 'Brixton FC Youth', played: '12', won: '7', drawn: '1', lost: '4', gf: '22', ga: '18', gd: '+4', points: '22' },
      { position: 4, team: 'Balham Athletic U12', played: '12', won: '6', drawn: '2', lost: '4', gf: '20', ga: '17', gd: '+3', points: '20' },
      { position: 5, team: 'Wandsworth Juniors', played: '12', won: '5', drawn: '3', lost: '4', gf: '18', ga: '20', gd: '-2', points: '18' },
      { position: 6, team: 'Clapham FC Youth', played: '12', won: '4', drawn: '2', lost: '6', gf: '16', ga: '24', gd: '-8', points: '14' },
      { position: 7, team: 'Crystal Palace Academy', played: '12', won: '3', drawn: '1', lost: '8', gf: '12', ga: '28', gd: '-16', points: '10' },
      { position: 8, team: 'South London Youth FC', played: '12', won: '1', drawn: '1', lost: '10', gf: '8', ga: '29', gd: '-21', points: '4' },
    ],
    lastUpdated: new Date().toISOString(),
    isMock: true,
  }
}
