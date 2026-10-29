# Haunted House Tours

A haunted house tour site where visitors browse houses by scare level (mild, spooky, terrifying), open a house to see its tour times with spots left, and book spots. Tours can never be overbooked.

## Stack
- **Front end:** React + Vite + React Router (in `client/`)
- **Back end:** Node + Express + SQLite via better-sqlite3 (in `server/`)

## What you need installed
- [Node.js](https://nodejs.org/) 20 or newer (this includes `npm`)
- Git

## Install
```bash
git clone https://github.com/anikethbuddolla/haunted-house-tours.git
cd haunted-house-tours
cd server && npm install
cd ../client && npm install
```

## Run (two terminals)

**Terminal 1: API server** (port 3001)
```bash
cd server
npm start
```
You should see `API running at http://localhost:3001`. The first run creates `server/haunted.db`, fills it with the houses from `client/src/data/houses.json`, and adds 3 tour slots per house.

**Terminal 2: React app** (port 5173)
```bash
cd client
npm run dev
```

Then open **http://localhost:5173** in your browser.

The React dev server forwards every `/api/...` request to the API on port 3001 (see `client/vite.config.js`), so both must be running.

## Pages
- `/`: home page
- `/houses`: house grid with a scare-level filter and a "My Tour" list
- `/houses/:id`: one house's tour times with spots left, and the booking form (a full slot shows "Full")

## API
See [API_CONTRACT.md](API_CONTRACT.md). Quick check with the API running:
```bash
curl http://localhost:3001/api/houses?scare=terrifying
```

## Reset the data
Stop the API, delete `server/haunted.db`, and start it again. The houses and slots are re-seeded and all bookings are cleared.
