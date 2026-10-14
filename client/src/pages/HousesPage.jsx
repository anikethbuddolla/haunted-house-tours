import { useState } from 'react'
import HouseGrid from '../components/HouseGrid.jsx'
import TourList from '../components/TourList.jsx'

// HousesPage: the scare-level dropdown, the house grid, and the "My Tour" panel.
// tourList, onAdd and onRemove are props from App; this page just passes them along.
function HousesPage({ tourList, onAdd, onRemove }) {
  // Local state: only this page needs to know the chosen scare level.
  const [scare, setScare] = useState('all')

  return (
    <section>
      <h1>Houses</h1>

      <label className="filter">
        Scare level:{' '}
        <select value={scare} onChange={(event) => setScare(event.target.value)}>
          <option value="all">All</option>
          <option value="mild">mild</option>
          <option value="spooky">spooky</option>
          <option value="terrifying">terrifying</option>
        </select>
      </label>

      <HouseGrid scare={scare} onAdd={onAdd} />

      <TourList tourList={tourList} onRemove={onRemove} />
    </section>
  )
}

export default HousesPage
