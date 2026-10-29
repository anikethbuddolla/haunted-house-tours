import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SlotList from '../components/SlotList.jsx'
import BookingForm from '../components/BookingForm.jsx'

// HousePage: reads the house id from the URL and shows that house.
// key={id} makes React start a fresh HouseDetails (fresh state) when the id changes,
// so nothing from one house (an error, the chosen slot) leaks onto another.
function HousePage() {
  // useParams reads the :id part of the URL, e.g. "3" on /houses/3.
  const { id } = useParams()
  return <HouseDetails key={id} id={id} />
}

// HouseDetails: one house's details, its tour slots with spots left, and the booking form.
function HouseDetails({ id }) {
  const [house, setHouse] = useState(null)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  // The chosen slot lives here so both SlotList (Book buttons) and BookingForm (dropdown) can set it.
  const [slotId, setSlotId] = useState('')
  // Bumping this number re-runs the fetch (Retry, and after a booking).
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let ignore = false // set to true if a newer fetch starts, so an old reply can't overwrite it

    // Fetch GET /api/houses (for this house's name) and GET /api/houses/:id/slots at the same time.
    Promise.all([fetch('/api/houses'), fetch(`/api/houses/${id}/slots`)])
      .then(async ([housesRes, slotsRes]) => {
        if (slotsRes.status === 404) return { notFound: true }
        if (!housesRes.ok || !slotsRes.ok) throw new Error('Bad response')
        const houses = await housesRes.json()
        return {
          house: houses.find((h) => String(h.id) === id),
          slots: await slotsRes.json(),
        }
      })
      .then((data) => {
        if (ignore) return
        if (data.notFound) {
          setNotFound(true)
        } else {
          setHouse(data.house)
          setSlots(data.slots)
          setError('')
        }
      })
      .catch(() => {
        if (!ignore) setError('Could not load this house. Is the server running?')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [id, reloadCount])

  function handleRetry() {
    setLoading(true)
    setError('')
    setReloadCount(reloadCount + 1)
  }

  // After a booking, re-fetch quietly (no "Loading..." flash) so spots left updates in place.
  function refreshSlots() {
    setReloadCount(reloadCount + 1)
  }

  if (loading) return <p className="status">Loading tour times...</p>

  if (notFound) {
    return (
      <div className="status">
        <p>House not found.</p>
        <Link to="/houses">Back to all houses</Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="status error">
        <p>{error}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    )
  }

  return (
    <section>
      <Link to="/houses">&larr; All houses</Link>
      <h1>{house.name}</h1>
      <span className={`scare-badge scare-${house.scare}`}>{house.scare}</span>
      <p>{house.description}</p>

      <h2>Tour times</h2>
      {slots.length === 0 ? (
        <p className="status">No tour times for this house yet.</p>
      ) : (
        <>
          <SlotList slots={slots} selectedSlotId={slotId} onPick={setSlotId} />
          <BookingForm
            slots={slots}
            slotId={slotId}
            onSlotChange={setSlotId}
            refreshSlots={refreshSlots}
          />
        </>
      )}
    </section>
  )
}

export default HousePage
