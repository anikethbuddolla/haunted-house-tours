import { useEffect, useState } from 'react'
import HouseCard from './HouseCard.jsx'

// HouseGrid: loads houses from the API and renders one HouseCard per house with .map().
// A house added to the database shows here with no code change.
// Props: scare (the filter from HousesPage) and onAdd (from App).
// HousesPage gives this component key={scare}, so a new scare level starts a fresh
// grid (loading = true again) instead of showing the old houses while fetching.
function HouseGrid({ scare, onAdd }) {
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Bumping this number re-runs the fetch (used by the Retry button).
  const [reloadCount, setReloadCount] = useState(0)

  // useEffect runs the fetch after the first render, and again when Retry bumps reloadCount.
  useEffect(() => {
    let ignore = false // set to true if a newer fetch starts, so an old reply can't overwrite it

    // GET /api/houses, with ?scare=... when a level is picked (see API_CONTRACT.md).
    const url = scare === 'all' ? '/api/houses' : `/api/houses?scare=${scare}`
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!ignore) setHouses(data)
      })
      .catch(() => {
        if (!ignore) setError('Could not load houses. Is the server running?')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [scare, reloadCount])

  function handleRetry() {
    setLoading(true)
    setError('')
    setReloadCount(reloadCount + 1)
  }

  if (loading) return <p className="status">Loading houses...</p>

  if (error) {
    return (
      <div className="status error">
        <p>{error}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    )
  }

  if (houses.length === 0) {
    return <p className="status">No houses match that scare level.</p>
  }

  return (
    <div className="house-grid">
      {houses.map((house) => (
        // key gives React a unique id for each card so it can track them in the list.
        <HouseCard
          key={house.id}
          id={house.id}
          name={house.name}
          scare={house.scare}
          description={house.description}
          onAdd={() => onAdd(house)}
        />
      ))}
    </div>
  )
}

export default HouseGrid
