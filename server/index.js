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

// GET /api/houses/:id/slots: one house's tour slots with spots_left. 404 if the house does not exist.
app.get('/api/houses/:id/slots', (req, res) => {
  const house = db.prepare('SELECT id FROM houses WHERE id = ?').get(req.params.id)
  if (!house) {
    return res.status(404).json({ error: 'House not found' })
  }

  // spots_left is worked out from the bookings every time, not stored:
  // LEFT JOIN keeps slots with no bookings, SUM adds their party sizes,
  // and COALESCE turns "no bookings" (NULL) into 0.
  const slots = db
    .prepare(
      `SELECT s.id, s.house_id, s.start_time, s.capacity,
              s.capacity - COALESCE(SUM(b.party_size), 0) AS spots_left
       FROM tour_slots s
       LEFT JOIN bookings b ON b.slot_id = s.id
       WHERE s.house_id = ?
       GROUP BY s.id
       ORDER BY s.start_time`
    )
    .all(house.id)
  res.json(slots)
})

// POST /api/bookings: stub for now. Booking logic (validation + 409 when full) comes in the next session.
app.post('/api/bookings', (req, res) => {
  res.status(501).json({ message: 'not implemented yet' })
})

// GET /api/bookings: list every saved booking, oldest first.
app.get('/api/bookings', (req, res) => {
  res.json(db.prepare('SELECT * FROM bookings ORDER BY id').all())
})

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`)
})
