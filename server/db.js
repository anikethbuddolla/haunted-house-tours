const path = require('path')
const Database = require('better-sqlite3')
const seedHouses = require('../client/src/data/houses.json')

// Open (or create) the SQLite database file. Data in this file survives server restarts.
const db = new Database(path.join(__dirname, 'haunted.db'))

// SQLite ignores foreign keys unless this is switched on for each connection.
db.pragma('foreign_keys = ON')

// houses:     the haunted houses visitors can browse.
// tour_slots: a tour time at one house, with how many people it can hold in total.
// bookings:   one visitor's reservation of party_size spots in one slot.
//
// There is no spots_left column. It is always calculated as
// capacity - SUM(party_size of that slot's bookings), so it can never drift
// out of sync with the bookings that actually exist.
db.exec(`
  CREATE TABLE IF NOT EXISTS houses (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    scare TEXT NOT NULL CHECK (scare IN ('mild', 'spooky', 'terrifying')),
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tour_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    house_id INTEGER NOT NULL REFERENCES houses(id),
    start_time TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot_id INTEGER NOT NULL REFERENCES tour_slots(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    party_size INTEGER NOT NULL CHECK (party_size > 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`)

// Seed houses from houses.json, but only if the table is empty,
// so restarting the server never creates duplicates.
const houseCount = db.prepare('SELECT COUNT(*) AS count FROM houses').get().count
if (houseCount === 0) {
  const insert = db.prepare(
    'INSERT INTO houses (id, name, scare, description) VALUES (@id, @name, @scare, @description)'
  )
  for (const house of seedHouses) insert.run(house)
  console.log(`Seeded ${seedHouses.length} houses`)
}

// Seed 3 Halloween-night slots per house (capacities 4 to 10), only if there are no slots yet.
const slotCount = db.prepare('SELECT COUNT(*) AS count FROM tour_slots').get().count
if (slotCount === 0) {
  const times = ['2026-10-31 19:00', '2026-10-31 21:00', '2026-10-31 23:00']
  const capacities = [4, 5, 6, 7, 8, 9, 10]
  const insert = db.prepare('INSERT INTO tour_slots (house_id, start_time, capacity) VALUES (?, ?, ?)')
  const houses = db.prepare('SELECT id FROM houses ORDER BY id').all()
  let i = 0
  for (const house of houses) {
    for (const time of times) {
      insert.run(house.id, time, capacities[i % capacities.length])
      i++
    }
  }
  console.log(`Seeded ${houses.length * times.length} tour slots`)
}

module.exports = db
