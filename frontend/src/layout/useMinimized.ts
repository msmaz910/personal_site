import { useState } from 'react'

const KEY = 'chat-minimized'

/** Whether the desktop chat card is minimized. Remembered for the browser tab session. */
export function useMinimized() {
  const [minimized, setMinimized] = useState(() => sessionStorage.getItem(KEY) === 'true')

  function update(value: boolean) {
    sessionStorage.setItem(KEY, String(value))
    setMinimized(value)
  }

  return [minimized, update] as const
}
