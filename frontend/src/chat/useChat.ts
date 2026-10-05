import { useState } from 'react'
import { ChatError, GENERIC_ERROR, type Message, postChat } from './api.ts'

const KEY = 'chat-conversation'

type Conversation = { messages: Message[]; limitReached: boolean }

/** The saved conversation for this browser tab, or an empty one. */
function load(): Conversation {
  const saved = sessionStorage.getItem(KEY)
  return saved ? JSON.parse(saved) : { messages: [], limitReached: false }
}

/**
 * Chat state for the tab session: the conversation and whether the backend has closed
 * it (both saved in sessionStorage), the question awaiting a reply, and the latest error.
 * History is never trimmed here: the backend counts every user message for its limit.
 */
export function useChat() {
  const [conversation, setConversation] = useState(load)
  const [asking, setAsking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Sends one question and reports how it ended: a reply, the closing reply that
   * reached the limit, or a failure (the error is recorded and the history is unchanged).
   */
  async function send(question: string): Promise<'replied' | 'closed' | 'failed'> {
    const messages: Message[] = [...conversation.messages, { role: 'user', content: question }]
    setAsking(question)
    setError(null)
    try {
      const { reply, limit_reached } = await postChat(messages)
      const next = { messages: [...messages, { role: 'assistant' as const, content: reply }], limitReached: limit_reached }
      sessionStorage.setItem(KEY, JSON.stringify(next))
      setConversation(next)
      return limit_reached ? 'closed' : 'replied'
    } catch (caught) {
      setError(caught instanceof ChatError ? caught.message : GENERIC_ERROR)
      return 'failed'
    } finally {
      setAsking(null)
    }
  }

  return { ...conversation, asking, error, send }
}
