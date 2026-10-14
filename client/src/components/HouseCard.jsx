// HouseCard: shows one haunted house. It has no house data of its own;
// everything (name, scare, description, onAdd) arrives as props from HouseGrid.
function HouseCard({ name, scare, description, onAdd }) {
  return (
    <article className="house-card">
      <h3>{name}</h3>
      <span className={`scare-badge scare-${scare}`}>{scare}</span>
      <p>{description}</p>
      <button onClick={onAdd}>Add to my tour</button>
    </article>
  )
}

export default HouseCard
