# Site images

Drop these two image files into this folder (exact filenames matter):

- **`badge.png`** — the club badge / crest. Used as the logo in the top navigation
  bar and the footer. A square PNG with a transparent or solid background works best.
- **`fox.jpg`** — the fox photo. Used as the hero banner on the **About** page.

Until `badge.png` is present, the site falls back to a simple drawn fox crest, so
nothing looks broken. Once you add the file and refresh, your real badge appears.

These files are served by Vite from `/images/<filename>` (e.g. `/images/badge.png`).
