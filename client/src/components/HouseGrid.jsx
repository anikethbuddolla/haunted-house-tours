import houses from '../data/houses.json'
import HouseCard from './HouseCard.jsx'

// HouseGrid: reads the house list from houses.json and renders one HouseCard per house.
// The `scare` prop comes from App; "all" shows every house, otherwise only matching ones.
function HouseGrid({ scare }) {
  const visibleHouses =
    scare === 'all' ? houses : houses.filter((house) => house.scare === scare)

  return (
    <div className="house-grid">
      {visibleHouses.map((house) => (
        <HouseCard key={house.id} house={house} />
      ))}
    </div>
  )
}

export default HouseGrid
