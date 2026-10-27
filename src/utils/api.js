// talks to our server about google calendar

// only send what the server needs (not the photo)
const slim = (post) => ({ id: post.id, author: post.author, event: post.event })

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) {
    const err = new Error('Not connected to Google')
    err.notConnected = true // signed out or login expired
    throw err
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

// add an event to the signed in person's google calendar
export function sendToGoogle(post, reminder) {
  return postJson('/api/calendar/add', { post: slim(post), reminder }) // -> { ok, link }
}

// after an edit, update it in their calendar if they added it
export function updateInGoogle(post) {
  return postJson('/api/calendar/update', { post: slim(post) }) // -> { updated }
}
