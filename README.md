# Instagram Event Tags 📅

**Save a campus event from an Instagram post to your calendar in one tap.**

Clubs post their events on Instagram, and students screenshot the flyer and forget about it. This project adds an **Event tag** to posts. Tap it, pick a reminder, and the event goes straight into your Google, Apple, or Outlook Calendar. If the club changes the time or room later, your calendar updates on its own.

A working prototype with a real React frontend, a Node backend, a SQLite database, and the Google Calendar API, built as a product management project (Fall 2026).

> This is a student concept project. It is not made by or affiliated with Instagram or Meta.

<p align="center">
  <img src="docs/screenshots/1-feed.png" width="230" alt="Feed with an event tag on a post" />
  <img src="docs/screenshots/2-event-card.png" width="230" alt="Event details with reminder and calendar choice" />
  <img src="docs/screenshots/3-added.png" width="230" alt="Event added to Google Calendar" />
</p>

---

## Features

### For students
- **Event tag on posts.** Tap it to see the date, time, location, and how many people added it.
- **Pick a reminder:** 1 day before, 1 hour before, or none.
- **Google Calendar:** sign in once with Google and the event is added to your real calendar automatically, with your reminder and a color for each club.
- **Apple and Outlook Calendar:** downloads an event file (.ics) that opens in your calendar app, no sign in needed.
- **No duplicates.** Adding the same event twice updates it instead of making a second copy.
- **Bookmark nudge.** Saving a post with an event asks if you want it in your calendar too.
- **First time walkthrough** and a tooltip so people know the tag exists.

### For clubs (creators)
- **Add Event** when making a post: name, date, time, location, plus a live preview.
- **Post insights:** event tag taps, calendar adds, adds by day, and which reminders people picked. Totals only, never who.
- **Edit an event** and it updates in every Google Calendar it was added to.
- **Delete a post** and the event is removed from those calendars too.

<p align="center">
  <img src="docs/screenshots/0-intro.png" width="230" alt="First time walkthrough" />
  <img src="docs/screenshots/4-create-event.png" width="230" alt="Creating an event on a new post" />
  <img src="docs/screenshots/5-insights.png" width="230" alt="Post insights for the organizer" />
</p>

---

## How it works

```
 Browser (React)            Server (Node + Express)             Google
 ───────────────            ───────────────────────             ──────
 tap "Add to Google"  ──▶   who is this? (session cookie)
                            look up the event in the database
                            sign in as this user with their
                            saved Google keys              ──▶   Calendar API adds
                                                                 the event
 "Added!" + link      ◀──   save the add in the database   ◀──   event id + link
```

- **Sign in:** Google OAuth. The server keeps each person's Google login keys in the database. The browser only gets a random session cookie that the page can't read.
- **Database:** one SQLite file with four tables: `users`, `sessions`, `posts`, and `adds` (who added which event, to which calendar, with which reminder).
- **Edits:** when a club edits an event, the server finds everyone who added it to Google, signs in as each of them, and updates their event, all at the same time.
- **Insights** are counted live from the `adds` table.

---

## Built with

| Part | Tools |
| --- | --- |
| Frontend | React, Vite, plain CSS |
| Backend | Node.js, Express |
| Database | SQLite (built into Node 22.13+) |
| APIs | Google OAuth 2.0, Google Calendar API |
| Other | .ics calendar files for Apple and Outlook |

---

## Run it yourself

You need **Node 22.13 or newer** (check with `node -v`) and a Google Cloud project with the Calendar API turned on.

**1. Get the code**
```bash
git clone https://github.com/salonisanaroy-dotcom/insta-events.git
cd insta-events
npm install
cd server && npm install && cd ..
```

**2. Add your Google keys**

Make a file called `server/.env`:
```
PORT=3001
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```
In Google Cloud, set the authorized JavaScript origin to `http://localhost:5173` and the redirect URI to the one above. While the app is in testing mode, add your Google account as a test user.

**3. Start it (two terminals)**
```bash
# terminal 1: the server
cd server
npm run dev
```
```bash
# terminal 2: the website
npm run dev
```
Then open **http://localhost:5173**.

`.env` and `insta.db` are in `.gitignore` because they hold secret keys and people's logins. Never commit them.

---

## Project structure

```
insta-events/
├── src/                     the React app
│   ├── App.jsx              all the screens and what happens on each tap
│   ├── components/          small pieces: Post, Flyer, EventTag, Sheet...
│   ├── screens/             student screens: Feed, EventCard, AddedSheet...
│   │   └── creator/         club screens: NewPost, EventForm, Insights
│   └── utils/               api.js (talks to the server), .ics files, dates
├── server/
│   ├── index.js             all the routes (sign in, posts, calendar)
│   ├── db.js                the database tables
│   └── seed.js              the starting demo post
└── docs/screenshots/
```

---

## How it was built

This started as a product management project, so the app changed based on real feedback.

1. **Problem:** students miss club events because a flyer post is easy to forget.
2. **Research:** user interviews and empathy maps, then requirements and user flows.
3. **V1:** first version built and tested with 3 users in recorded feedback sessions.
4. **What users said and what changed in V2:**
   - *"I use Apple Calendar."* Added Apple and Outlook.
   - *"I didn't know I could tap the tag."* Added a walkthrough, a tooltip, and a pulse on the tag.
   - *"I saved the post first."* The bookmark now offers to add the event.
   - *"Every club looks the same in my calendar."* Each club now gets its own color.
5. **Backend:** a real server, Google sign in, adding events with the Calendar API, then a database with a login for each person.

| Version | What's in it |
| --- | --- |
| Day 1 | Express server connected to the React app |
| Day 2 | Sign in with Google |
| Day 3 | Events added straight to Google Calendar with reminders and colors |
| Day 4 | SQLite database, a login per person, edits and deletes reach everyone's calendar |

---

## What's next

- [ ] Put it online so it runs without my laptop
- [ ] Only the club that made a post can edit or delete it
- [ ] Real accounts for clubs
- [ ] Notify people when an event they added changes

---

Made by **Saloni Roy**, UT Dallas, Computer Science + Economics
