// tiny wrappers around localStorage (the browser's long term memory)
// try/catch because some browsers block it, and the app should still work
export function load(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // no storage, no problem, it just won't remember
  }
}
