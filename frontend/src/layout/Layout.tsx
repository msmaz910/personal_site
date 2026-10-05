import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Outlet } from 'react-router'
import ChatPanel from '../chat/ChatPanel.tsx'
import Footer from './Footer.tsx'
import Header from './Header.tsx'
import { useWideScreen } from './useWideScreen.ts'

/**
 * Shared frame for every page: header, page content and footer, with the chat docked
 * beside them on wide screens. On narrow screens the chat opens full screen and the
 * page behind it is inert; growing to a wide screen closes it, so it never reopens on its own.
 */
function Layout() {
  const wide = useWideScreen()
  const [open, setOpen] = useState(false)
  const askRef = useRef<HTMLButtonElement>(null)
  const modal = open && !wide
  if (wide && open) setOpen(false)

  /** Closes the full-screen chat and returns focus to the button that opened it. */
  function closeChat() {
    flushSync(() => setOpen(false))
    askRef.current?.focus()
  }

  return (
    <>
      <div className="site-top" inert={modal}>
        <Header askRef={askRef} onAsk={() => setOpen(true)} />
      </div>
      <div className="page">
        <div className="page-body" inert={modal}>
          <main>
            <Outlet />
          </main>
          <Footer />
        </div>
        <ChatPanel hidden={!wide && !open} modal={modal} onClose={closeChat} />
      </div>
    </>
  )
}

export default Layout
