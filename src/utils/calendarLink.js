import { gcalStamp } from './eventFormat'

// builds a real google calendar link with the event already filled in
export function googleCalendarLink(post) {
  const { event } = post
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${gcalStamp(event.date, event.startTime)}/${gcalStamp(event.date, event.endTime)}`,
    ctz: 'America/Chicago',
    location: event.location,
    details: `Added from Instagram (@${post.author})\nView post: ${window.location.origin}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
