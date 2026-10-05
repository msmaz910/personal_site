import { type FormEvent, type KeyboardEvent, type RefObject, useEffect, useRef, useState } from 'react'
import { starterQuestions } from '../data/chat.ts'
import { useChat } from './useChat.ts'

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
 * Messages go through useChat; replies render as React text, never as HTML.
 * An empty chat offers starter questions, which send like typed ones.
 */
function ChatPanel({ hidden, modal, dismissRef, onDismiss }: Props) {
  const { messages, limitReached, asking, error, send } = useChat()
  const [draft, setDraft] = useState('')
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const canSend = draft.trim() !== '' && asking === null && !limitReached
  const showStarters = messages.length === 0 && asking === null

  useEffect(() => {
    if (modal) dismissRef.current?.focus()
  }, [modal, dismissRef])

  useEffect(() => {
    const log = logRef.current!
    const question = log.querySelector<HTMLElement>('.chat-user:nth-last-child(2)')
    log.scrollTop = asking === null && question ? question.offsetTop : log.scrollHeight
  }, [messages, asking, error, hidden])

  /** Closes the full-screen chat on Escape. */
  function closeOnEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && modal) onDismiss()
  }

  /**
   * Sends a question. A failed request puts it back in the box unless the visitor has
   * typed something else; the closing reply locks the box, so focus moves to the
   * conversation, where the reply is announced.
   */
  async function ask(question: string) {
    const result = await send(question)
    if (result === 'failed') setDraft((current) => current || question)
    if (result === 'closed') logRef.current!.focus()
  }

  /** Sends a starter question. Focus moves to the box first, because the buttons unmount. */
  function pick(question: string) {
    inputRef.current!.focus()
    return ask(question)
  }

  /** Sends the typed draft and clears the box. */
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!canSend) return
    const question = draft.trim()
    setDraft('')
    await ask(question)
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
        <h2 id="chat-title">Ask my Digital Twin</h2>
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
      <div ref={logRef} className="chat-log" role="log" aria-label="Conversation" aria-busy={asking !== null} tabIndex={0}>
        <p className="chat-welcome">Hi! Ask me anything about Michelle's work and background.</p>
        {messages.map((message, index) => (
          <p key={index} className={`chat-bubble chat-${message.role}`}>
            {message.content}
          </p>
        ))}
        {asking !== null && (
          <>
            <p className="chat-bubble chat-user">{asking}</p>
            <div className="chat-bubble chat-assistant">
              <span className="visually-hidden">Thinking…</span>
              <span className="chat-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </div>
          </>
        )}
      </div>
      {showStarters && (
        <div className="chat-starters" role="group" aria-label="Suggested questions">
          {starterQuestions.map((question) => (
            <button key={question} type="button" className="button button-secondary" onClick={() => pick(question)}>
              {question}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p className="chat-error" role="alert">
          {error}
        </p>
      )}
      <form className="chat-form" onSubmit={submit}>
        <label htmlFor="chat-input" className="visually-hidden">
          Your question
        </label>
        <input
          ref={inputRef}
          id="chat-input"
          type="text"
          placeholder="Ask a question"
          autoComplete="off"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={limitReached}
        />
        <button type="submit" className="button" disabled={!canSend}>
          Send
        </button>
      </form>
    </section>
  )
}

export default ChatPanel
