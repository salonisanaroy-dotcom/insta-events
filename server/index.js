import express from 'express'
import { google } from 'googleapis'
import crypto from 'node:crypto'
import { db } from './db.js'

const app = express()
const PORT = process.env.PORT || 3001
const FRONTEND_URL = 'http://localhost:5173'

app.use(express.json({ limit: '10mb' })) // read json from the frontend (big enough for a photo)

// what we ask google permission for
const SCOPES = [
  'openid', 'email', 'profile', // who you are
  'https://www.googleapis.com/auth/calendar.events', // add + edit calendar events
]

// a google login helper set up with our app's keys from .env
function makeClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  )
}

// ================= day 4: who is this? (sessions) =================

// the browser sends cookies as one string: "sid=abc; other=xyz". turn it into { sid: 'abc', ... }
function readCookies(req) {
  const cookies = {}
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name) cookies[name] = decodeURIComponent(rest.join('='))
  }
  return cookies
}

// the signed in user for this browser, or null
function currentUser(req) {
  const { sid } = readCookies(req)
  if (!sid) return null
  return db.prepare(`
    SELECT users.* FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.id = ?`).get(sid) ?? null
}

// a google client signed in as one user (anyone, not just whoever is using the site right now)
function googleFor(user) {
  const client = makeClient()
  client.setCredentials(JSON.parse(user.tokens))
  // login keys expire after about an hour, google sends fresh ones, so save them
  client.on('tokens', (fresh) => {
    const { tokens } = db.prepare('SELECT tokens FROM users WHERE id = ?').get(user.id)
    db.prepare('UPDATE users SET tokens = ? WHERE id = ?').run(JSON.stringify({ ...JSON.parse(tokens), ...fresh }), user.id)
  })
  return google.calendar({ version: 'v3', auth: client })
}

// ================= posts: database row -> what the frontend wants =================

function timeAgo(iso) {
  const minutes = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

// count the adds for one post: total, by reminder, and by day for the last 7 days
function statsFor(row) {
  const adds = db.prepare('SELECT reminder, added_at FROM adds WHERE post_id = ?').all(row.id)
  const reminders = { '1 day before': 0, '1 hour before': 0, 'No reminder': 0 }
  const addsByDay = [0, 0, 0, 0, 0, 0, 0] // oldest day first, today last

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (const add of adds) {
    if (add.reminder in reminders) reminders[add.reminder]++
    const day = new Date(add.added_at)
    day.setHours(0, 0, 0, 0)
    const daysAgo = Math.round((today - day) / 86400000)
    if (daysAgo >= 0 && daysAgo < 7) addsByDay[6 - daysAgo]++
  }
  return { reached: row.reached, tagTaps: row.tag_taps, added: adds.length, reminders, addsByDay }
}

// one post, shaped like the old src/data/posts.js, plus whether *you* added it
function toPost(row, user) {
  const mine = user && db.prepare('SELECT * FROM adds WHERE post_id = ? AND user_id = ?').get(row.id, user.id)
  return {
    id: row.id,
    author: row.author,
    authorInitial: row.author_initial,
    school: row.school,
    caption: row.caption,
    likes: row.likes,
    comments: row.comments,
    postedAgo: timeAgo(row.created_at),
    imageUrl: row.image_url,
    flyerTop: row.flyer_top,
    flyerTitle: row.flyer_title,
    colors: JSON.parse(row.colors),
    event: row.event ? JSON.parse(row.event) : null,
    stats: statsFor(row),
    addedByMe: Boolean(mine),
    addedTo: mine?.calendar ?? null,
  }
}

const findPost = (id) => db.prepare('SELECT * FROM posts WHERE id = ?').get(Number(id))

// ================= google calendar helpers (from day 3) =================

// reminder chip -> minutes before the event
const reminderMinutes = { '1 day before': 24 * 60, '1 hour before': 60 }

// each account always gets the same google calendar color (google has colors 1 to 11)
function colorFor(author) {
  const total = [...author].reduce((sum, letter) => sum + letter.charCodeAt(0), 0)
  return String((total % 11) + 1)
}

// our post -> the shape google calendar wants
function toGoogleEvent(post, reminder) {
  const { event } = post
  const minutes = reminderMinutes[reminder] // undefined for "no reminder"
  return {
    summary: event.title,
    location: event.location,
    description: `Added from Instagram (@${post.author})\nView post: ${FRONTEND_URL}`,
    start: { dateTime: `${event.date}T${event.startTime}:00`, timeZone: 'America/Chicago' },
    end: { dateTime: `${event.date}T${event.endTime}:00`, timeZone: 'America/Chicago' },
    colorId: colorFor(post.author),
    reminders: {
      useDefault: false, // use our reminder, not their calendar's default
      overrides: minutes ? [{ method: 'popup', minutes }] : [],
    },
  }
}

// update their google event if it's still there, otherwise add a new one. returns google's event
async function putInCalendar(user, post, reminder, eventId) {
  const calendar = googleFor(user)
  const requestBody = toGoogleEvent(post, reminder)
  if (eventId) {
    try {
      return (await calendar.events.patch({ calendarId: 'primary', eventId, requestBody })).data
    } catch (err) {
      if (err.code !== 404 && err.code !== 410) throw err // 404/410 = they deleted it, so add again
    }
  }
  return (await calendar.events.insert({ calendarId: 'primary', requestBody })).data
}

// save an add. a signed in person only ever has one row per post (it gets updated)
function saveAdd(postId, user, calendar, reminder, googleEventId = null) {
  db.prepare(`
    INSERT INTO adds (post_id, user_id, calendar, reminder, google_event_id, added_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (post_id, user_id) DO UPDATE SET
      calendar = excluded.calendar,
      reminder = excluded.reminder,
      google_event_id = COALESCE(excluded.google_event_id, adds.google_event_id)
  `).run(postId, user?.id ?? null, calendar, reminder, googleEventId, new Date().toISOString())
}

// ================= routes =================

// quick check that the server's alive
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// step 1: send the user to google's real sign in page
app.get('/auth/google', (req, res) => {
  const url = makeClient().generateAuthUrl({
    access_type: 'offline', // get a refresh token so we stay logged in
    prompt: 'consent', // always show the permission screen
    scope: SCOPES,
  })
  res.redirect(url)
})

// step 2: google sends them back here with a one time code
app.get('/auth/google/callback', async (req, res) => {
  const { code, error } = req.query
  if (error) return res.redirect(`${FRONTEND_URL}/?connected=0`) // they hit cancel

  try {
    const client = makeClient()
    const { tokens } = await client.getToken(code) // trade the code for real keys
    client.setCredentials(tokens)
    const { data: profile } = await google.oauth2({ version: 'v2', auth: client }).userinfo.get()

    // new person? add them. seen them before? update their keys
    const existing = db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id)
    let userId
    if (existing) {
      const merged = { ...JSON.parse(existing.tokens), ...tokens } // keep the old refresh token if google didn't send a new one
      db.prepare('UPDATE users SET email = ?, name = ?, tokens = ? WHERE id = ?')
        .run(profile.email, profile.name, JSON.stringify(merged), existing.id)
      userId = existing.id
    } else {
      userId = db.prepare('INSERT INTO users (google_id, email, name, tokens) VALUES (?, ?, ?, ?)')
        .run(profile.id, profile.email, profile.name, JSON.stringify(tokens)).lastInsertRowid
    }

    // give this browser its own session, remembered in a cookie for 30 days
    const sid = crypto.randomUUID()
    db.prepare('INSERT INTO sessions (id, user_id, created_at) VALUES (?, ?, ?)').run(sid, userId, new Date().toISOString())
    res.cookie('sid', sid, {
      httpOnly: true, // the page's javascript can't read it, only the server
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    console.log(`signed in as ${profile.email}`)
    res.redirect(`${FRONTEND_URL}/?connected=1`)
  } catch (err) {
    console.error('google sign in failed:', err.message)
    res.redirect(`${FRONTEND_URL}/?connected=0`)
  }
})

// who is signed in on this browser
app.get('/api/me', (req, res) => {
  const user = currentUser(req)
  if (!user) return res.json({ connected: false })
  res.json({ connected: true, email: user.email, name: user.name }) // never send the tokens
})

// sign out this browser only. your events still get updates if an organizer edits them
app.get('/auth/logout', (req, res) => {
  const { sid } = readCookies(req)
  if (sid) db.prepare('DELETE FROM sessions WHERE id = ?').run(sid)
  res.clearCookie('sid')
  res.redirect(FRONTEND_URL)
})

// the feed, newest first
app.get('/api/posts', (req, res) => {
  const user = currentUser(req)
  const rows = db.prepare('SELECT * FROM posts ORDER BY id DESC').all()
  res.json(rows.map((row) => toPost(row, user)))
})

// share a new post
app.post('/api/posts', (req, res) => {
  const p = req.body
  if (!p.caption && !p.event) return res.status(400).json({ error: 'A post needs a caption or an event' })

  const { lastInsertRowid } = db.prepare(`
    INSERT INTO posts (author, author_initial, school, caption, image_url, flyer_top, flyer_title,
                       colors, event, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    p.author, p.authorInitial, p.school, p.caption ?? '', p.imageUrl ?? null, p.flyerTop, p.flyerTitle,
    JSON.stringify(p.colors), p.event ? JSON.stringify(p.event) : null, new Date().toISOString(),
  )
  console.log(`new post #${lastInsertRowid}${p.event ? `: "${p.event.title}"` : ''}`)
  res.json(toPost(findPost(lastInsertRowid), currentUser(req)))
})

// someone tapped the event tag (for insights)
app.post('/api/posts/:id/tap', (req, res) => {
  db.prepare('UPDATE posts SET tag_taps = tag_taps + 1 WHERE id = ?').run(Number(req.params.id))
  const row = findPost(req.params.id)
  if (!row) return res.status(404).json({ error: 'No such post' })
  res.json(toPost(row, currentUser(req)))
})

// apple / outlook add (the browser downloaded the file, we just count it)
app.post('/api/posts/:id/added', (req, res) => {
  const row = findPost(req.params.id)
  if (!row) return res.status(404).json({ error: 'No such post' })
  const user = currentUser(req)
  saveAdd(row.id, user, req.body.calendar, req.body.reminder)
  res.json(toPost(row, user))
})

// student taps "add to google calendar"
app.post('/api/calendar/add', async (req, res) => {
  const user = currentUser(req)
  if (!user) return res.status(401).json({ error: 'Not connected to Google' })
  const row = findPost(req.body.postId)
  if (!row?.event) return res.status(404).json({ error: 'No such event' })

  try {
    const post = toPost(row, user) // the event details come from our database, not the browser
    const mine = db.prepare('SELECT google_event_id FROM adds WHERE post_id = ? AND user_id = ?').get(row.id, user.id)
    const saved = await putInCalendar(user, post, req.body.reminder, mine?.google_event_id)
    saveAdd(row.id, user, 'google', req.body.reminder, saved.id)

    console.log(`added "${post.event.title}" to ${user.email}'s calendar`)
    res.json({ link: saved.htmlLink, post: toPost(row, user) })
  } catch (err) {
    console.error('adding to calendar failed:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// organizer edits an event: save it, then update it in EVERY google calendar it was added to
app.put('/api/posts/:id/event', async (req, res) => {
  const row = findPost(req.params.id)
  if (!row?.event) return res.status(404).json({ error: 'No such event' })
  const { event } = req.body
  db.prepare('UPDATE posts SET event = ? WHERE id = ?').run(JSON.stringify(event), row.id)

  let updated = 0
  let failed = 0
  if (event.autoUpdate) {
    const post = toPost(findPost(row.id), null)
    // everyone who added it with google (we saved their event id + reminder)
    const people = db.prepare(`
      SELECT users.*, adds.reminder, adds.google_event_id FROM adds
      JOIN users ON users.id = adds.user_id
      WHERE adds.post_id = ? AND adds.google_event_id IS NOT NULL`).all(row.id)

    // send them all at once instead of waiting for each one
    const results = await Promise.allSettled(
      people.map(async (person) => {
        const saved = await putInCalendar(person, post, person.reminder, person.google_event_id)
        db.prepare('UPDATE adds SET google_event_id = ? WHERE post_id = ? AND user_id = ?').run(saved.id, row.id, person.id)
      }),
    )
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') updated++
      else {
        failed++
        console.error(`couldn't update ${people[i].email}'s calendar:`, r.reason.message)
      }
    })
    console.log(`edited "${event.title}": updated ${updated} Google Calendar(s)${failed ? `, ${failed} failed` : ''}`)
  }

  res.json({ post: toPost(findPost(row.id), currentUser(req)), updated, failed })
})

app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`))
