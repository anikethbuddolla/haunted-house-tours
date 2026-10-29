import { Link } from 'react-router-dom'

// HouseCard: shows one haunted house. It has no house data of its own;
// everything (id, name, scare, description, onAdd) arrives as props from HouseGrid.
function HouseCard({ id, name, scare, description, onAdd }) {
  return (
    <article className="house-card">
      <h3>{name}</h3>
      <span className={`scare-badge scare-${scare}`}>{scare}</span>
      <p>{description}</p>
      <div className="card-actions">
        <Link to={`/houses/${id}`} className="button-link">View tour times</Link>
        <button onClick={onAdd}>Add to my tour</button>
      </div>
    </article>
  )
}

export default HouseCard
