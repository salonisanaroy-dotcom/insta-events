import express from 'express'
import { google } from 'googleapis'
import fs from 'node:fs'

const app = express()
const PORT = process.env.PORT || 3001
const FRONTEND_URL = 'http://localhost:5173'
const TOKEN_FILE = './tokens.json' // where we save your google login (git ignores it)

app.use(express.json()) // lets us read json the frontend sends

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

// read + write the saved login (a file for now, a database on day 4)
function loadLogin() {
  if (!fs.existsSync(TOKEN_FILE)) return null
  return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'))
}
function saveLogin(data) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2))
}

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

    // ask google who just signed in
    const { data: user } = await google.oauth2({ version: 'v2', auth: client }).userinfo.get()

    saveLogin({ tokens, email: user.email, name: user.name })
    console.log(`signed in as ${user.email}`)
    res.redirect(`${FRONTEND_URL}/?connected=1`)
  } catch (err) {
    console.error('google sign in failed:', err.message)
    res.redirect(`${FRONTEND_URL}/?connected=0`)
  }
})

// the frontend asks this to see if you're signed in
app.get('/api/me', (req, res) => {
  const login = loadLogin()
  if (!login) return res.json({ connected: false })
  res.json({ connected: true, email: login.email, name: login.name }) // never send the tokens
})

// sign out (handy for testing the flow again)
app.get('/auth/logout', (req, res) => {
  if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE)
  res.redirect(FRONTEND_URL)
})

// ================= day 3: add events to google calendar =================

// a google client that's already signed in as the saved user
function signedInClient() {
  const login = loadLogin()
  if (!login) return null
  const client = makeClient()
  client.setCredentials(login.tokens)
  // login keys expire after about an hour, google sends fresh ones, so save them
  client.on('tokens', (fresh) => {
    const current = loadLogin()
    if (current) saveLogin({ ...current, tokens: { ...current.tokens, ...fresh } })
  })
  return { client, login }
}

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

// adds the event, or updates it if this person already added it (no duplicates)
async function saveToCalendar(signedIn, post, reminder) {
  const calendar = google.calendar({ version: 'v3', auth: signedIn.client })
  const added = signedIn.login.added ?? {} // post id -> google event id
  const existing = added[post.id]
  const requestBody = toGoogleEvent(post, reminder)

  let result
  if (existing) {
    try {
      result = await calendar.events.patch({ calendarId: 'primary', eventId: existing.eventId, requestBody })
    } catch (err) {
      // they deleted it from their calendar, so just add it again
      if (err.code !== 404 && err.code !== 410) throw err
    }
  }
  if (!result) {
    result = await calendar.events.insert({ calendarId: 'primary', requestBody })
  }

  // remember which google event belongs to which post
  const latest = loadLogin()
  saveLogin({ ...latest, added: { ...(latest.added ?? {}), [post.id]: { eventId: result.data.id, reminder } } })
  return result.data
}

// student taps "add to google calendar"
app.post('/api/calendar/add', async (req, res) => {
  const signedIn = signedInClient()
  if (!signedIn) return res.status(401).json({ error: 'Not connected to Google' })

  try {
    const { post, reminder } = req.body
    const saved = await saveToCalendar(signedIn, post, reminder)
    console.log(`added "${post.event.title}" to ${signedIn.login.email}'s calendar`)
    res.json({ ok: true, link: saved.htmlLink }) // link straight to the event in google calendar
  } catch (err) {
    console.error('adding to calendar failed:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// organizer edits an event: update it in the calendar of whoever added it
app.post('/api/calendar/update', async (req, res) => {
  const signedIn = signedInClient()
  const { post } = req.body
  const existing = signedIn?.login.added?.[post.id]
  if (!existing) return res.json({ updated: false }) // nobody here added it, nothing to do

  try {
    await saveToCalendar(signedIn, post, existing.reminder) // keep the reminder they picked
    console.log(`updated "${post.event.title}" in ${signedIn.login.email}'s calendar`)
    res.json({ updated: true })
  } catch (err) {
    console.error('updating calendar failed:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`))
