// everything the app asks our server for, in one place

async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) {
    const err = new Error('Not connected to Google')
    err.notConnected = true // signed out or login expired
    err.needsCalendar = Boolean(data.needsCalendar) // signed in, but didn't allow calendar access
    throw err
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

// who's signed in on this browser -> { connected, email, name }
export const getMe = () => request('GET', '/api/me')

// the whole feed from the database, newest first
export const getPosts = () => request('GET', '/api/posts')

// share a new post -> the saved post (with its real id)
export const createPost = (post) => request('POST', '/api/posts', post)

// count a tap on the event tag -> the post with new stats
export const tapEventTag = (id) => request('POST', `/api/posts/${id}/tap`)

// apple / outlook: the file downloaded, just count it -> the post with new stats
export const countAdd = (id, reminder, calendar) => request('POST', `/api/posts/${id}/added`, { reminder, calendar })

// google: the server puts it in their real calendar -> { link, post }
export const sendToGoogle = (id, reminder) => request('POST', '/api/calendar/add', { postId: id, reminder })

// organizer saves an edit -> { post, updated, failed } (updated = google calendars changed)
export const saveEvent = (id, event) => request('PUT', `/api/posts/${id}/event`, { event })

// organizer deletes a post -> { removed } (google calendars it was taken out of)
export const deletePost = (id) => request('DELETE', `/api/posts/${id}`)
