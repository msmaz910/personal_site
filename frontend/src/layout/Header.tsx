import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { pages } from '../pages.tsx'

/** Site name and main navigation. Below 40rem the links collapse behind a menu button. */
function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <Link to="/" className="site-name">
        {import.meta.env.VITE_SITE_NAME}
      </Link>
      <button
        type="button"
        className="nav-toggle"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="main-menu"
        onClick={() => setOpen(!open)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <nav aria-label="Main">
        <ul id="main-menu" role="list">
          {pages.map(({ path, label }) => (
            <li key={path}>
              <NavLink to={path} onClick={() => setOpen(false)}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Header
