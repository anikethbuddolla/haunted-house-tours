// TourList: the "My Tour" panel listing the names of houses the visitor added.
// Props: tourList (the array from App's state) and onRemove (to take one out).
function TourList({ tourList, onRemove }) {
  return (
    <aside className="tour-list">
      <h2>My Tour</h2>
      {/* Conditional rendering: show a message when empty, otherwise the list. */}
      {tourList.length === 0 ? (
        <p>No houses added yet</p>
      ) : (
        <ul>
          {tourList.map((house) => (
            <li key={house.id}>
              {house.name}{' '}
              <button onClick={() => onRemove(house.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

export default TourList
