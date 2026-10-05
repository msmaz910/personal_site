import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Outlet } from 'react-router'
import ChatPanel from '../chat/ChatPanel.tsx'
import Footer from './Footer.tsx'
import Header from './Header.tsx'
import { useMinimized } from './useMinimized.ts'
import { useWideScreen } from './useWideScreen.ts'

/**
 * Shared frame for every page: header, page content and footer, with the chat docked
 * beside them on wide screens, where it can be minimized. On narrow screens the chat
 * opens full screen and the page behind it is inert; growing to a wide screen closes it,
 * so it never reopens on its own.
 */
function Layout() {
  const wide = useWideScreen()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useMinimized()
  const askRef = useRef<HTMLButtonElement>(null)
  const dismissRef = useRef<HTMLButtonElement>(null)
  const modal = open && !wide
  if (wide && open) setOpen(false)

  /** Closes the full-screen chat or minimizes the card, then focuses the header button that brings it back. */
  function dismissChat() {
    flushSync(() => (modal ? setOpen(false) : setMinimized(true)))
    askRef.current?.focus()
  }

  /** Header button: restores the card on wide screens, opens the full-screen chat on narrow ones. */
  function showChat() {
    if (!wide) return setOpen(true)
    flushSync(() => setMinimized(false))
    dismissRef.current?.focus()
  }

  return (
    <>
      <div className="site-top" inert={modal}>
        <Header askRef={askRef} onAsk={showChat} wide={wide} minimized={minimized} />
      </div>
      <div className="page">
        <div className="page-body" inert={modal}>
          <main>
            <Outlet />
          </main>
          <Footer />
        </div>
        <ChatPanel
          hidden={wide ? minimized : !open}
          modal={modal}
          dismissRef={dismissRef}
          onDismiss={dismissChat}
        />
      </div>
    </>
  )
}

export default Layout
