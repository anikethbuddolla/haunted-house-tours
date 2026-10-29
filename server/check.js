// check.js: end-to-end checks against the RUNNING API (start it first with `npm start`).
// Run with: npm run check   (or: node check.js)
// Every result line comes from a real HTTP request; nothing is assumed.
// Test bookings use emails like check-<run id>@example.com and are deleted at the end,
// so running this leaves your data as it was.
const path = require('path')
const Database = require('better-sqlite3')

const BASE = process.env.API_URL || 'http://localhost:3001'
const RUN_ID = Date.now()
const testEmail = (n) => `check-${RUN_ID}-${n}@example.com`

let passed = 0
let failed = 0

function report(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n      ${detail}` : ''}`)
  if (ok) passed++
  else failed++
}

// Send one request and return { status, data } (data is null if the reply isn't JSON).
async function api(method, url, body) {
  const res = await fetch(BASE + url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    // not JSON
  }
  return { status: res.status, data }
}

const book = (slot_id, name, email, party_size) =>
  api('POST', '/api/bookings', { slot_id, name, email, party_size })
const bookingCount = async () => (await api('GET', '/api/bookings')).data.length
async function getSlot(houseId, slotId) {
  const { data } = await api('GET', `/api/houses/${houseId}/slots`)
  return data.find((s) => s.id === slotId)
}

// Find a slot (any house) with at least `min` spots left, so the tests don't depend on old data.
async function findSlotWithSpots(min) {
  const { data: houses } = await api('GET', '/api/houses')
  for (const house of houses) {
    const { data: slots } = await api('GET', `/api/houses/${house.id}/slots`)
    const slot = slots.find((s) => s.spots_left >= min)
    if (slot) return slot
  }
  return null
}

async function main() {
  console.log(`Checking ${BASE} (run ${RUN_ID})\n`)

  // 1. GET /api/houses/1/slots returns slots with spots_left
  {
    const { status, data } = await api('GET', '/api/houses/1/slots')
    const ok =
      status === 200 &&
      Array.isArray(data) &&
      data.length > 0 &&
      data.every(
        (s) =>
          s.house_id === 1 &&
          Number.isInteger(s.spots_left) &&
          s.spots_left >= 0 &&
          s.spots_left <= s.capacity &&
          typeof s.start_time === 'string'
      )
    report('GET /api/houses/1/slots returns slots with spots_left', ok,
      `status ${status}, ${Array.isArray(data) ? data.length : 0} slots: ` +
        (Array.isArray(data) ? data.map((s) => `#${s.id} ${s.spots_left}/${s.capacity}`).join(', ') : JSON.stringify(data)))
  }

  // Pick a slot with room for the booking tests.
  const slot = await findSlotWithSpots(3)
  if (!slot) {
    report('setup: find a slot with at least 3 spots left', false,
      'every slot is (nearly) full; reset the data: stop the API, delete server/haunted.db, start it again')
    return
  }
  console.log(`(using slot #${slot.id} at house ${slot.house_id}: ${slot.spots_left}/${slot.capacity} spots left)\n`)

  // 2. Valid POST returns 201 and spots_left drops by party_size
  {
    const before = slot.spots_left
    const countBefore = await bookingCount()
    const { status, data } = await book(slot.id, 'Check Valid', testEmail(1), 2)
    const after = (await getSlot(slot.house_id, slot.id)).spots_left
    const countAfter = await bookingCount()
    const ok = status === 201 && data.spots_left === before - 2 && after === before - 2 && countAfter === countBefore + 1
    report('valid POST /api/bookings returns 201 and spots_left drops by party_size', ok,
      `status ${status}, party_size 2, spots_left ${before} -> ${after} (response said ${data && data.spots_left}), bookings ${countBefore} -> ${countAfter}`)
  }

  // 3. Empty name returns 400 and saves nothing
  {
    const countBefore = await bookingCount()
    const { status, data } = await book(slot.id, '', testEmail(2), 1)
    const countAfter = await bookingCount()
    report('empty name returns 400 and saves nothing', status === 400 && countAfter === countBefore,
      `status ${status}, ${JSON.stringify(data)}, bookings ${countBefore} -> ${countAfter}`)
  }

  // 4. Empty email returns 400 and saves nothing
  {
    const countBefore = await bookingCount()
    const { status, data } = await book(slot.id, 'Check No Email', '', 1)
    const countAfter = await bookingCount()
    report('empty email returns 400 and saves nothing', status === 400 && countAfter === countBefore,
      `status ${status}, ${JSON.stringify(data)}, bookings ${countBefore} -> ${countAfter}`)
  }

  // 5. Overbooking returns 409 "Not enough spots left" and saves nothing
  {
    const left = (await getSlot(slot.house_id, slot.id)).spots_left
    const countBefore = await bookingCount()
    const { status, data } = await book(slot.id, 'Check Overbook', testEmail(3), left + 1)
    const countAfter = await bookingCount()
    const leftAfter = (await getSlot(slot.house_id, slot.id)).spots_left
    const ok = status === 409 && data && data.error === 'Not enough spots left' && countAfter === countBefore && leftAfter === left
    report('overbooking returns 409 "Not enough spots left" and saves nothing', ok,
      `party_size ${left + 1} with ${left} left: status ${status}, ${JSON.stringify(data)}, bookings ${countBefore} -> ${countAfter}`)
  }

  // 6. Missing slot returns 404
  {
    const { status, data } = await book(999999, 'Check Missing', testEmail(4), 1)
    report('a missing slot returns 404', status === 404 && data && data.error === 'Slot not found',
      `status ${status}, ${JSON.stringify(data)}`)
  }

  // 7. Booking a slot down to 0 leaves spots_left at 0 (and one more spot is refused)
  {
    const left = (await getSlot(slot.house_id, slot.id)).spots_left
    const fill = await book(slot.id, 'Check Fill', testEmail(5), left)
    const afterFill = (await getSlot(slot.house_id, slot.id)).spots_left
    const extra = await book(slot.id, 'Check Extra', testEmail(6), 1)
    const afterExtra = (await getSlot(slot.house_id, slot.id)).spots_left
    const ok = fill.status === 201 && fill.data.spots_left === 0 && afterFill === 0 && extra.status === 409 && afterExtra === 0
    report('booking a slot down to 0 leaves spots_left at 0', ok,
      `booked the last ${left}: status ${fill.status}, spots_left ${afterFill}; one more: status ${extra.status}, spots_left still ${afterExtra}`)
  }

  // Extra contract checks
  {
    const { status, data } = await api('GET', '/api/houses/999/slots')
    report('(extra) GET /api/houses/999/slots returns 404', status === 404, `status ${status}, ${JSON.stringify(data)}`)
  }
  {
    const countBefore = await bookingCount()
    const { status, data } = await book(slot.id, 'Check Party', testEmail(7), 0)
    const countAfter = await bookingCount()
    report('(extra) party_size 0 returns 400 and saves nothing', status === 400 && countAfter === countBefore,
      `status ${status}, ${JSON.stringify(data)}`)
  }
}

// Delete only the bookings this run created, so your data is back to how it was.
function cleanUp() {
  try {
    const db = new Database(path.join(__dirname, 'haunted.db'))
    const { changes } = db.prepare('DELETE FROM bookings WHERE email LIKE ?').run(`check-${RUN_ID}-%`)
    db.close()
    console.log(`\nCleaned up ${changes} test booking(s).`)
  } catch (err) {
    console.log(`\nCould not clean up test bookings: ${err.message}`)
  }
}

main()
  .catch((err) => {
    report('check run crashed', false, `${err.message} (is the server running on ${BASE}?)`)
  })
  .finally(() => {
    cleanUp()
    console.log(`\n${passed} passed, ${failed} failed`)
    process.exitCode = failed > 0 ? 1 : 0
  })
