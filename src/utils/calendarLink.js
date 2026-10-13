// builds a real google calendar link with the event already filled in
export function googleCalendarLink(event) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${event.start}/${event.end}`,
    ctz: event.timeZone,
    location: event.locationFull,
    details: `Added from Instagram (@${event.host})\nView post: ${window.location.origin}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
