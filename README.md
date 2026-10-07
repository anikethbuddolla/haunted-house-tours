# Haunted House Tours

A haunted house tour site where visitors browse houses by scare level (mild, spooky, terrifying) and send a tour booking request.

## Stack
- **Front end:** React + Vite (in `client/`)
- **Coming later:** Node/Express back end and SQLite database

## Run it
```bash
cd client
npm install
npm run dev
```
Then open the URL Vite prints (usually http://localhost:5173).

## Current status (Session 1: M1 + M2)
- House data comes from `client/src/data/houses.json` (will move to a database later).
- Scare-level dropdown filters the house grid.
- Booking form renders but does not save anything yet.
