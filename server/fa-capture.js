// One-off diagnostic tool. Run on a machine that can reach the FA site:
//
//   npm run fa:install     (first time only — downloads Chromium)
//   npm run fa:capture
//
// It opens the FA Full-Time page in a real headless browser, waits for the
// JavaScript to render the tables, then saves:
//   server/data/fa-capture.html  — the fully-rendered page HTML
//   server/data/fa-capture.png   — a full-page screenshot
//
// Send those (or a snippet of the HTML) back and the parser can be tuned to
// your league's exact layout.

import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { faUrl } from './faConfig.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, 'data')
fs.mkdirSync(outDir, { recursive: true })

const url = faUrl()
console.log('Opening FA Full-Time page in a headless browser...')
console.log(url)

let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch {
  console.error('\nPlaywright is not installed. Run:  npm install  then  npm run fa:install\n')
  process.exit(1)
}

let browser
try {
  browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-GB',
    viewport: { width: 1280, height: 2000 },
  })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })

  // Give the SPA a moment, then try to wait until at least one real table renders.
  try {
    await page.waitForSelector('table', { timeout: 20000 })
  } catch {
    console.warn('No <table> appeared within 20s — saving whatever rendered anyway.')
  }
  await page.waitForTimeout(2000)

  const html = await page.content()
  const htmlPath = path.join(outDir, 'fa-capture.html')
  const pngPath = path.join(outDir, 'fa-capture.png')
  fs.writeFileSync(htmlPath, html)
  await page.screenshot({ path: pngPath, fullPage: true })

  const tableCount = (html.match(/<table/gi) || []).length
  console.log(`\nDone.`)
  console.log(`  HTML  -> ${htmlPath}  (${tableCount} <table> elements, ${html.length} bytes)`)
  console.log(`  Image -> ${pngPath}`)
  console.log(`\nIf tableCount is 0, the page likely needs different wait logic or is blocking us.`)
} catch (err) {
  console.error('\nCapture failed:', err.message)
  console.error('If this is a network/timeout error, confirm the FA page opens in your normal browser.')
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
}
