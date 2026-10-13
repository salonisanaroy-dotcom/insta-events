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

app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`))
