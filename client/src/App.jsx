import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import HomePage from './pages/HomePage.jsx'
import HousesPage from './pages/HousesPage.jsx'
import BookingForm from './components/BookingForm.jsx'

// App: the top-level component. It owns the tour list state and decides
// which page to show for each URL.
function App() {
  // State lives here ("lifting state up") because both Nav (the count) and
  // HousesPage (add/remove) need it. Children get it through props.
  const [tourList, setTourList] = useState([])

  function addToTour(house) {
    // Skip houses already in the tour so each one appears only once.
    if (tourList.some((item) => item.id === house.id)) return
    // Never mutate state (no push). Build a NEW array instead, so React
    // sees a different array and knows it must re-render.
    setTourList([...tourList, house])
  }

  function removeFromTour(id) {
    // filter returns a NEW array without the removed house; the old one is untouched.
    setTourList(tourList.filter((house) => house.id !== id))
  }

  return (
    <>
      <Nav tourCount={tourList.length} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/houses"
            element={
              <HousesPage
                tourList={tourList}
                onAdd={addToTour}
                onRemove={removeFromTour}
              />
            }
          />
          <Route path="/book" element={<BookingForm />} />
        </Routes>
      </main>
    </>
  )
}

export default App
