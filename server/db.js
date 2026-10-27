// the database. on your laptop it's a file (insta.db). online it's Turso, a hosted
// copy of the same kind of database, so it doesn't get wiped when the server restarts
import { createClient } from '@libsql/client'
import { seedPosts, seedAdds } from './seed.js'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:insta.db', // no turso url = use the local file
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// three small helpers so the rest of the code stays short
// get = one row (or undefined), all = list of rows, run = change something
export async function get(sql, ...args) {
  const result = await client.execute({ sql, args })
  return result.rows[0]
}
export async function all(sql, ...args) {
  const result = await client.execute({ sql, args })
  return result.rows
}
export async function run(sql, ...args) {
  const result = await client.execute({ sql, args })
  return { lastInsertRowid: Number(result.lastInsertRowid) }
}

// is this a brand new database? (checked before we make the tables)
const isNew = !(await get("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'posts'"))

// the tables (like sheets in a spreadsheet). "if not exists" = only the first time
await client.executeMultiple(`
  -- everyone who signed in with google
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    google_id TEXT UNIQUE,  -- google's id for them, never changes
    email TEXT,
    name TEXT,
    tokens TEXT             -- their google login keys (never sent to the browser)
  );

  -- which browser is signed in as which user (the "sid" cookie)
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,    -- long random string, stored in the cookie
    user_id INTEGER,
    created_at TEXT
  );

  -- every post in the feed
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    author TEXT,
    author_initial TEXT,
    school TEXT,
    caption TEXT,
    image_url TEXT,         -- the photo, shrunk and saved as text
    flyer_top TEXT,
    flyer_title TEXT,
    colors TEXT,            -- json, like ["#0f766e","#2563eb"]
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    event TEXT,             -- json with title, date, times, location... (empty for normal posts)
    reached INTEGER DEFAULT 0,
    tag_taps INTEGER DEFAULT 0,
    created_at TEXT
  );

  -- one row each time someone adds a post's event to a calendar
  CREATE TABLE IF NOT EXISTS adds (
    id INTEGER PRIMARY KEY,
    post_id INTEGER,
    user_id INTEGER,        -- empty if they weren't signed in (apple / outlook)
    calendar TEXT,          -- google, apple, outlook (or demo for the made up starting numbers)
    reminder TEXT,
    google_event_id TEXT,   -- so we can update it in their google calendar later
    added_at TEXT,
    UNIQUE (post_id, user_id) -- a signed in person counts once per post
  );
`)

// first run only: put the Hack Night post (and its made up demo numbers) in
// (so if you delete it later, it doesn't come back on restart)
if (isNew) {
  for (const p of seedPosts) {
    const { lastInsertRowid: postId } = await run(
      `INSERT INTO posts (author, author_initial, school, caption, image_url, flyer_top, flyer_title,
                          colors, likes, comments, event, reached, tag_taps, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      p.author, p.authorInitial, p.school, p.caption, null, p.flyerTop, p.flyerTitle,
      JSON.stringify(p.colors), p.likes, p.comments, JSON.stringify(p.event), p.reached, p.tagTaps,
      p.createdAt,
    )
    // all 42 demo adds in one trip instead of 42 trips
    await client.batch(
      seedAdds.map((a) => ({
        sql: 'INSERT INTO adds (post_id, calendar, reminder, added_at) VALUES (?, ?, ?, ?)',
        args: [postId, 'demo', a.reminder, a.addedAt],
      })),
      'write',
    )
  }
  console.log('new database, added the starting post')
}
