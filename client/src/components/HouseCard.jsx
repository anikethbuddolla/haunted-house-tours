// HouseCard: shows one haunted house (name, scare level, description).
// It receives a single `house` object as a prop from HouseGrid.
function HouseCard({ house }) {
  return (
    <article className="house-card">
      <h3>{house.name}</h3>
      <span className={`scare-badge scare-${house.scare}`}>{house.scare}</span>
      <p>{house.description}</p>
    </article>
  )
}

export default HouseCard
