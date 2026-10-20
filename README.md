# Instagram Events → Google Calendar

A product prototype that adds an **Event tag** to Instagram posts so students can save
campus events straight to Google Calendar instead of screenshotting flyers and forgetting.

Built for the UTD AKPsi PM Career Plan (Fall 2026).

## Features
- Instagram-style feed with event posts and a tappable Event tag
- Real Google sign-in (OAuth) to connect Google Calendar
- Creator flow: make a post, add event details, preview, share
- Live insights: tag taps, calendar adds, and reminder choices (totals only)
- Edit an event with a confirmation before updating attendees

## Tech
React (Vite), Node.js + Express, Google Calendar API

## Run it locally
1. `npm install` in the main folder and in `server/`
2. Create `server/.env` with your own Google OAuth keys:
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
   `GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback`
3. Run `npm run dev` in `server/` and in the main folder
4. Open http://localhost:5173

*Concept prototype for a class project. Not affiliated with Instagram, Meta, or Google.*