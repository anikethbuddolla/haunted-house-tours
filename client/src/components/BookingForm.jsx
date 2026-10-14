import { useState } from 'react'

const EMPTY_FORM = { name: '', email: '', message: '', scare: 'mild' }

// BookingForm: the tour booking request form. On submit it POSTs to /api/bookings,
// shows the server's error on a 400, or a success message and clears the form.
function BookingForm() {
  // One state object holds every field ("controlled inputs": React owns the values).
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
      // POST /api/bookings with the form as JSON (see API_CONTRACT.md).
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        // 400: show the server's error message; nothing was saved.
        setError(data.error || 'Something went wrong.')
        return
      }

      setSuccess(`Thanks, ${data.name}! Your tour request was saved.`)
      setForm(EMPTY_FORM)
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h2>Request a Tour</h2>

      <label>
        Name
        <input type="text" name="name" value={form.name} onChange={handleChange} />
      </label>

      <label>
        Email
        <input type="email" name="email" value={form.email} onChange={handleChange} />
      </label>

      <label>
        Scare level
        <select name="scare" value={form.scare} onChange={handleChange}>
          <option value="mild">mild</option>
          <option value="spooky">spooky</option>
          <option value="terrifying">terrifying</option>
        </select>
      </label>

      <label>
        Message
        <textarea name="message" rows="4" value={form.message} onChange={handleChange} />
      </label>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      <button type="submit" disabled={sending}>
        {sending ? 'Sending...' : 'Send Request'}
      </button>
    </form>
  )
}

export default BookingForm
