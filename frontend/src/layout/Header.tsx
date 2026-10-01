import { Link, NavLink } from 'react-router'
import { pages } from '../pages.tsx'

/** Site name and main navigation. NavLink marks the current page with aria-current. */
function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="site-name">
        {import.meta.env.VITE_SITE_NAME}
      </Link>
      <nav aria-label="Main">
        <ul>
          {pages.map(({ path, label }) => (
            <li key={path}>
              <NavLink to={path}>{label}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Header
