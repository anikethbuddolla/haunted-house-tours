import { useState } from 'react'
import { formatTime, spotsText } from '../utils/formatTime.js'

const EMPTY_FORM = { name: '', email: '', party_size: '1' }

// BookingForm: book spots in one of this house's slots.
// On submit it POSTs to /api/bookings, shows the server's error (400 / 404 / 409),
// or a confirmation, then clears the form and asks HousePage to re-fetch the slots.
// Props: slots, slotId + onSlotChange (the chosen slot lives in HousePage so SlotList can set it too),
// and refreshSlots (re-loads spots left without a page reload).
function BookingForm({ slots, slotId, onSlotChange, refreshSlots }) {
  // Controlled inputs: React state holds every field's value.
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sending, setSending] = useState(false)

  function handleChange(event) {
    // Copy the old form and replace one field; never edit the state object directly.
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser's full-page form submit
    setError('')
    setSuccess('')
    setSending(true)

    try {
      // POST /api/bookings (see API_CONTRACT.md). Form inputs are strings, so convert the numbers.
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: Number(slotId),
          name: form.name,
          email: form.email,
          party_size: Number(form.party_size),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        // 400 / 404 / 409: show the server's message; nothing was saved.
        setError(data.error || 'Something went wrong.')
        // On 409 someone else may have just booked, so show the latest spots left.
        if (res.status === 409) refreshSlots()
        return
      }

      const slot = slots.find((s) => s.id === data.slot_id)
      setSuccess(
        `Booked! ${data.party_size} ${data.party_size === 1 ? 'spot' : 'spots'} for ${data.name}` +
          (slot ? ` on ${formatTime(slot.start_time)}.` : '.')
      )
      setForm(EMPTY_FORM)
      onSlotChange('')
      refreshSlots()
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h2>Book a Tour</h2>

      <label>
        Tour time
        <select value={slotId} onChange={(event) => onSlotChange(event.target.value)}>
          <option value="">Pick a time</option>
          {slots.map((slot) => (
            // Full slots stay visible but can't be picked.
            <option key={slot.id} value={slot.id} disabled={slot.spots_left === 0}>
              {formatTime(slot.start_time)} ({spotsText(slot.spots_left)})
            </option>
          ))}
        </select>
      </label>

      <label>
        Name
        <input type="text" name="name" value={form.name} onChange={handleChange} />
      </label>

      <label>
        Email
        <input type="email" name="email" value={form.email} onChange={handleChange} />
      </label>

      <label>
        Party size
        <input type="number" name="party_size" min="1" step="1" value={form.party_size} onChange={handleChange} />
      </label>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      <button type="submit" disabled={sending || !slotId}>
        {sending ? 'Booking...' : 'Book'}
      </button>
    </form>
  )
}

export default BookingForm
