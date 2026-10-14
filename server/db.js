const path = require('path')
const Database = require('better-sqlite3')
const seedHouses = require('../client/src/data/houses.json')

// Open (or create) the SQLite database file. Data in this file survives server restarts.
const db = new Database(path.join(__dirname, 'haunted.db'))

// Create the tables the first time the server runs.
db.exec(`
  CREATE TABLE IF NOT EXISTS houses (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    scare TEXT NOT NULL CHECK (scare IN ('mild', 'spooky', 'terrifying')),
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    scare TEXT NOT NULL DEFAULT 'mild',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`)

// Seed houses from houses.json, but only if the table is empty,
// so restarting the server never creates duplicates.
const { count } = db.prepare('SELECT COUNT(*) AS count FROM houses').get()
if (count === 0) {
  const insert = db.prepare(
    'INSERT INTO houses (id, name, scare, description) VALUES (@id, @name, @scare, @description)'
  )
  for (const house of seedHouses) insert.run(house)
  console.log(`Seeded ${seedHouses.length} houses`)
}

module.exports = db
