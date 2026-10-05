import { type KeyboardEvent, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

const CLOSED_KEY = 'chat-closed'

/** True on screens 40rem and wider, unless the visitor closed the chat earlier in this tab. */
function startsOpen() {
  return !sessionStorage.getItem(CLOSED_KEY) && window.matchMedia('(width >= 40rem)').matches
}

/** Floating "Ask me" button and its non-modal chat panel. Shown on every page. */
function ChatWidget() {
  const [open, setOpen] = useState(startsOpen)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  /** Opens the panel and moves focus to its close button. */
  function show() {
    flushSync(() => setOpen(true))
    closeRef.current?.focus()
  }

  /** Closes the panel and returns focus to the floating button. Remembered for the rest of the tab session. */
  function hide() {
    setOpen(false)
    sessionStorage.setItem(CLOSED_KEY, 'true')
    toggleRef.current?.focus()
  }

  /** Closes the panel on Escape while focus is inside the widget. */
  function closeOnEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) hide()
  }

  return (
    <div className="chat" onKeyDown={closeOnEscape}>
      <section id="chat-panel" className="chat-panel" role="dialog" aria-labelledby="chat-title" hidden={!open}>
        <div className="chat-header">
          <h2 id="chat-title">Ask about Michelle</h2>
          <button ref={closeRef} type="button" className="chat-close" aria-label="Close chat" onClick={hide}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <p>Hi! Ask me anything about Michelle's work and background.</p>
      </section>
      <button
        ref={toggleRef}
        type="button"
        className="button chat-toggle"
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={open ? hide : show}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
          <path d="M4 5h16v11H9l-5 4z" />
        </svg>
        Ask me
      </button>
    </div>
  )
}

export default ChatWidget
