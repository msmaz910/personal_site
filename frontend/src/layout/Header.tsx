import { type Ref, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { pages } from '../pages.tsx'

type Props = { askRef: Ref<HTMLButtonElement>; onAsk: () => void; wide: boolean; minimized: boolean }

/**
 * Site name and main navigation. The chat button opens the full-screen chat below 64rem;
 * on wider screens it shows only while the chat card is minimized, and restores it.
 * Below 40rem the links collapse behind a menu button.
 */
function Header({ askRef, onAsk, wide, minimized }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <Link to="/" className="site-name">
        {import.meta.env.VITE_SITE_NAME}
      </Link>
      {(!wide || minimized) && (
        <button
          ref={askRef}
          type="button"
          className="button ask-button"
          aria-haspopup={wide ? undefined : 'dialog'}
          aria-controls="chat-panel"
          onClick={onAsk}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <path d="M4 5h16v11H9l-5 4z" />
          </svg>
          AI Chat
        </button>
      )}
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
