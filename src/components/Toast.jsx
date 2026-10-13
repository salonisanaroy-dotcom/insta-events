import { useEffect } from 'react'

// little message at the bottom that disappears on its own
export default function Toast({ message, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500)
    return () => clearTimeout(timer)
  }, [message, onDone])

  return <div className="toast">{message}</div>
}
