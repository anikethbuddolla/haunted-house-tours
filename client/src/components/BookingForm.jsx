// BookingForm: the tour booking request form (name, email, message, scare level).
// For now it only renders. Submitting does nothing; saving comes later with the back end.
function BookingForm() {
  function handleSubmit(event) {
    // Stop the browser from reloading the page. Nothing is saved yet.
    event.preventDefault()
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h2>Request a Tour</h2>

      <label>
        Name
        <input type="text" name="name" />
      </label>

      <label>
        Email
        <input type="email" name="email" />
      </label>

      <label>
        Scare level
        <select name="scare" defaultValue="mild">
          <option value="mild">mild</option>
          <option value="spooky">spooky</option>
          <option value="terrifying">terrifying</option>
        </select>
      </label>

      <label>
        Message
        <textarea name="message" rows="4" />
      </label>

      <button type="submit">Send Request</button>
    </form>
  )
}

export default BookingForm
