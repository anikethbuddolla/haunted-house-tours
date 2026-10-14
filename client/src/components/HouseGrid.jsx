import houses from '../data/houses.json'
import HouseCard from './HouseCard.jsx'

// HouseGrid: reads houses.json and renders one HouseCard per house with .map().
// Adding a house to the JSON shows it here with no code change.
// Props: scare (the filter from HousesPage) and onAdd (from App).
function HouseGrid({ scare, onAdd }) {
  const visibleHouses =
    scare === 'all' ? houses : houses.filter((house) => house.scare === scare)

  return (
    <div className="house-grid">
      {visibleHouses.map((house) => (
        // key gives React a unique id for each card so it can track them in the list.
        <HouseCard
          key={house.id}
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
