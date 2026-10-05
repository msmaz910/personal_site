import { type KeyboardEvent, type RefObject, useEffect } from 'react'

type Props = {
  hidden: boolean
  modal: boolean
  dismissRef: RefObject<HTMLButtonElement | null>
  onDismiss: () => void
}

/**
 * The chat. Docked beside the page on wide screens, a full-screen dialog when `modal`,
 * hidden otherwise. The top-right button closes the full-screen chat or minimizes the
 * docked card. Always mounted, so its conversation survives closing and resizing.
 * tabIndex -1 keeps focus in the panel when its text is clicked, so Escape still closes it.
 * The message box is disabled until E6-2 connects it to the API.
 */
function ChatPanel({ hidden, modal, dismissRef, onDismiss }: Props) {
  useEffect(() => {
    if (modal) dismissRef.current?.focus()
  }, [modal, dismissRef])

  /** Closes the full-screen chat on Escape. */
  function closeOnEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && modal) onDismiss()
  }

  return (
    <section
      id="chat-panel"
      className="chat-panel"
      role={modal ? 'dialog' : undefined}
      aria-labelledby="chat-title"
      tabIndex={-1}
      hidden={hidden}
      onKeyDown={closeOnEscape}
    >
      <div className="chat-header">
        <h2 id="chat-title">Chat with my Digital Twin</h2>
        <button
          ref={dismissRef}
          type="button"
          className="chat-dismiss"
          aria-label={modal ? 'Close chat' : 'Minimize chat'}
          onClick={onDismiss}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d={modal ? 'M6 6l12 12M18 6L6 18' : 'M6 18h12'} />
          </svg>
        </button>
      </div>
      <p className="chat-welcome">Hi! Ask me anything about Michelle's work and background.</p>
      <form className="chat-form">
        <label htmlFor="chat-input" className="visually-hidden">
          Your question
        </label>
        <input id="chat-input" type="text" placeholder="Ask a question" disabled />
        <button type="submit" className="button" disabled>
          Send
        </button>
      </form>
    </section>
  )
}

export default ChatPanel
