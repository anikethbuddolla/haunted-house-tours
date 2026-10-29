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

// Spots left for one slot: capacity minus the party sizes already booked (undefined if no such slot).
const getSlotSpots = db.prepare(
  `SELECT s.id, s.capacity - COALESCE(SUM(b.party_size), 0) AS spots_left
   FROM tour_slots s
   LEFT JOIN bookings b ON b.slot_id = s.id
   WHERE s.id = ?
   GROUP BY s.id`
)
const insertBooking = db.prepare(
  'INSERT INTO bookings (slot_id, name, email, party_size) VALUES (?, ?, ?, ?)'
)
const getBooking = db.prepare('SELECT * FROM bookings WHERE id = ?')

// The capacity check and the insert run inside ONE transaction, so no other booking
// can sneak in between "check spots left" and "save". That is what prevents overbooking.
const bookSlot = db.transaction((slotId, name, email, partySize) => {
  const slot = getSlotSpots.get(slotId)
  if (!slot) return { status: 404, body: { error: 'Slot not found' } }
  if (partySize > slot.spots_left) return { status: 409, body: { error: 'Not enough spots left' } }

  const result = insertBooking.run(slot.id, name, email, partySize)
  const booking = getBooking.get(result.lastInsertRowid)
  return { status: 201, body: { ...booking, spots_left: slot.spots_left - partySize } }
})

// POST /api/bookings: book party_size spots in a slot.
// 400 bad input, 404 unknown slot, 409 not enough spots, 201 saved row + the slot's new spots_left.
app.post('/api/bookings', (req, res) => {
  const body = req.body || {}
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const partySize = body.party_size
  // Anything that isn't a whole number can't match a slot id, so it falls through to 404.
  const slotId = Number.isInteger(body.slot_id) ? body.slot_id : null

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' })
  }
  if (!Number.isInteger(partySize) || partySize < 1) {
    return res.status(400).json({ error: 'Party size must be a whole number of at least 1.' })
  }

  // .immediate() takes the database write lock at the start of the transaction,
  // so even a second server process would have to wait its turn.
  const { status, body: result } = bookSlot.immediate(slotId, name, email, partySize)
  res.status(status).json(result)
})

// GET /api/bookings: list every saved booking, oldest first.
app.get('/api/bookings', (req, res) => {
  res.json(db.prepare('SELECT * FROM bookings ORDER BY id').all())
})

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`)
})
