const express = require('express')
const cors = require('cors')
const db = require('./db')

const app = express()
const PORT = 3001
const SCARE_LEVELS = ['mild', 'spooky', 'terrifying']

app.use(cors()) // allow the React app on another port to call this API
app.use(express.json()) // turn JSON request bodies into req.body

// GET /api/houses (optional ?scare=mild|spooky|terrifying): list houses, filtered by scare level if given.
app.get('/api/houses', (req, res) => {
  const { scare } = req.query
  if (scare && !SCARE_LEVELS.includes(scare)) {
    return res.status(400).json({ error: 'scare must be mild, spooky, or terrifying' })
  }
  const houses = scare
    ? db.prepare('SELECT id, name, scare, description FROM houses WHERE scare = ? ORDER BY id').all(scare)
    : db.prepare('SELECT id, name, scare, description FROM houses ORDER BY id').all()
  res.json(houses)
})

// POST /api/bookings: save a booking request. 400 if name or email is empty, otherwise 201 + saved row.
app.post('/api/bookings', (req, res) => {
  const body = req.body || {}
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const scare = SCARE_LEVELS.includes(body.scare) ? body.scare : 'mild'

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' })
  }

  // The ? placeholders keep user input out of the SQL text (prevents SQL injection).
  const result = db
    .prepare('INSERT INTO bookings (name, email, message, scare) VALUES (?, ?, ?, ?)')
    .run(name, email, message, scare)
  const saved = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(saved)
})

// GET /api/bookings: list every saved booking, oldest first.
app.get('/api/bookings', (req, res) => {
  res.json(db.prepare('SELECT * FROM bookings ORDER BY id').all())
})

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`)
})
