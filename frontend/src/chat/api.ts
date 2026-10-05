export type Message = { role: 'user' | 'assistant'; content: string }
export type ChatReply = { reply: string; limit_reached: boolean }

export const GENERIC_ERROR = 'Something went wrong. Please try again.'

/** An error whose message is safe to show the visitor. */
export class ChatError extends Error {}

/**
 * Sends the whole conversation to /api/chat and returns the reply. A failed response
 * throws a ChatError with the backend's friendly `detail`, or a generic message when
 * the body has none (validation errors, or an HTML error page from a proxy).
 */
export async function postChat(messages: Message[]): Promise<ChatReply> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ChatError(typeof body?.detail === 'string' ? body.detail : GENERIC_ERROR)
  }
  return response.json()
}
