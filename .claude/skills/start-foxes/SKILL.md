---
name: start-foxes
description: Start (or restart) the Streatham & Balham Foxes Colts FC website locally — runs the Express API and Vite frontend together, verifies both are healthy, and reports the URLs. Use when the user wants to run, start, launch, boot, or restart the Foxes site / project / dev server.
---

# Start the SB Foxes Colts FC website

This project is a React (Vite) frontend + Express API backend that run together via `npm run dev`.

- Frontend (Vite): http://localhost:3000
- API backend (Express): http://localhost:3001
- Admin panel: http://localhost:3000/admin (default password `foxes2024`)

## Steps

0. **Ensure Node 20+.** The tooling (Vite 8, react-router 7, etc.) requires Node >= 20. Check with `node --version`; if it's older, switch with nvm: `nvm install 22 && nvm use 22 && nvm alias default 22` (an `.nvmrc` pinning `22` is in the repo, so `nvm use` alone works too). A crash like `yargs parser supports a minimum Node.js version of 20` means Node is too old.

1. **Ensure dependencies are installed.** If `node_modules/` is missing, run `npm install` first.

   ```bash
   cd /home/user/SBFoxesWebsite
   [ -d node_modules ] || npm install
   ```

2. **Kill any stale dev processes** so ports 3000/3001 are free (ignore errors if nothing is running):

   ```bash
   pkill -f "vite" 2>/dev/null; pkill -f "node server/index.js" 2>/dev/null; sleep 1; echo done
   ```

3. **Start both servers in the background.** `npm run dev` uses `concurrently` to launch the API and Vite together. Always run it backgrounded and pipe logs to a file — do NOT run it in the foreground (it never exits):

   ```bash
   cd /home/user/SBFoxesWebsite && npm run dev > /tmp/foxes-dev.log 2>&1 &
   sleep 6
   ```

4. **Verify both servers are healthy:**

   ```bash
   curl -s -o /dev/null -w "Frontend (3000): HTTP %{http_code}\n" http://localhost:3000
   curl -s -o /dev/null -w "API (3001):      HTTP %{http_code}\n" http://localhost:3001/api/table
   ```

   Both should return `HTTP 200`. If not, inspect the log: `tail -20 /tmp/foxes-dev.log`.

5. **Report to the user** the URLs (frontend, admin) and that the site is running.

## Notes

- The FA Fulltime site blocks automated requests (returns 403), so a `403` line in the log is expected — the API falls back to sample fixture/table data and labels it as such in the UI. This is not a failure.
- To stop the servers: `pkill -f "vite"; pkill -f "node server/index.js"`.
- To view live logs: `tail -f /tmp/foxes-dev.log`.
- Useful scripts (from `package.json`): `npm run dev` (both), `npm run server` (API only), `npm run client` (frontend only), `npm run build` (production build).
