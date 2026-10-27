import { gcalStamp } from './eventFormat'

// how far before the event each reminder goes off (ics format)
const reminderTimes = {
  '1 day before': '-P1D',
  '1 hour before': '-PT1H',
}

// commas, semicolons, and new lines need a backslash in ics files
const clean = (text) => text.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n')

// builds a .ics file, the standard event file apple calendar + outlook both open
export function buildIcs(post, reminder) {
  const { event } = post
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const alarm = reminderTimes[reminder]

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Insta Events Prototype//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    // tells the calendar what "Chicago time" means, including daylight savings
    'BEGIN:VTIMEZONE',
    'TZID:America/Chicago',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:-0600',
    'TZOFFSETTO:-0500',
    'TZNAME:CDT',
    'DTSTART:19700308T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0600',
    'TZNAME:CST',
    'DTSTART:19701101T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:post-${post.id}@insta-events-prototype`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=America/Chicago:${gcalStamp(event.date, event.startTime)}`,
    `DTEND;TZID=America/Chicago:${gcalStamp(event.date, event.endTime)}`,
    `SUMMARY:${clean(event.title)}`,
    `LOCATION:${clean(event.location)}`,
    `DESCRIPTION:${clean(`Added from Instagram (@${post.author})`)}`,
  ]

  // the reminder, unless they picked "no reminder"
  if (alarm) {
    lines.push('BEGIN:VALARM', `TRIGGER:${alarm}`, 'ACTION:DISPLAY', `DESCRIPTION:${clean(event.title)}`, 'END:VALARM')
  }

  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n') // ics files want windows style line endings
}

// makes the file and has the browser download it
export function downloadIcs(post, reminder) {
  const blob = new Blob([buildIcs(post, reminder)], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${post.event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`
  link.click()
  URL.revokeObjectURL(url) // clean up the temporary url
}
