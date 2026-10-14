import { Link } from 'react-router-dom'

// Nav: the top navigation bar. Link changes the URL without reloading the page.
// tourCount is a prop passed down from App's tourList state.
function Nav({ tourCount }) {
  return (
    <nav className="nav">
      <Link to="/">Home</Link>
      <Link to="/houses">Houses</Link>
      <Link to="/book">Book a Tour</Link>
      <Link to="/houses" className="tour-count">My Tour ({tourCount})</Link>
    </nav>
  )
}

export default Nav
