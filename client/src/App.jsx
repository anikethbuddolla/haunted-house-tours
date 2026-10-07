import { useState } from 'react'
import HouseGrid from './components/HouseGrid.jsx'
import BookingForm from './components/BookingForm.jsx'

// App: the main page. It holds the selected scare level in state,
// shows the dropdown filter, the house grid, and the booking form.
function App() {
  // useState remembers the chosen scare level; changing it re-renders the grid.
  const [scare, setScare] = useState('all')

  return (
    <main>
      <h1>Haunted House Tours</h1>

      <label className="filter">
        Scare level:{' '}
        <select value={scare} onChange={(event) => setScare(event.target.value)}>
          <option value="all">All</option>
          <option value="mild">mild</option>
          <option value="spooky">spooky</option>
          <option value="terrifying">terrifying</option>
        </select>
      </label>

      <HouseGrid scare={scare} />

      <BookingForm />
    </main>
  )
}

export default App
