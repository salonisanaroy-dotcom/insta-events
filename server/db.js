// day 4: the database. one file (insta.db) that keeps everything after a restart
// node has sqlite built in (node 22.13 or newer), so there's nothing to install
import { DatabaseSync } from 'node:sqlite'
import { seedPosts, seedAdds } from './seed.js'

export const db = new DatabaseSync('./insta.db') // makes the file the first time

// is this a brand new database? (checked before we make the tables)
const isNew = !db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'posts'").get()

// the tables (like sheets in a spreadsheet). "if not exists" = only the first time
db.exec(`
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
    colors TEXT,            -- json, like ["#4b1e78","#2f6fdb"]
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

// first run only: put the GBM post (and its made up demo numbers) in
// (so if you delete it later, it doesn't come back on restart)
if (isNew) {
  const insertPost = db.prepare(`
    INSERT INTO posts (author, author_initial, school, caption, image_url, flyer_top, flyer_title,
                       colors, likes, comments, event, reached, tag_taps, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const insertAdd = db.prepare('INSERT INTO adds (post_id, calendar, reminder, added_at) VALUES (?, ?, ?, ?)')

  for (const p of seedPosts) {
    const { lastInsertRowid: postId } = insertPost.run(
      p.author, p.authorInitial, p.school, p.caption, null, p.flyerTop, p.flyerTitle,
      JSON.stringify(p.colors), p.likes, p.comments, JSON.stringify(p.event), p.reached, p.tagTaps,
      p.createdAt,
    )
    for (const a of seedAdds) insertAdd.run(postId, 'demo', a.reminder, a.addedAt)
  }
  console.log('new database, added the starting post')
}
