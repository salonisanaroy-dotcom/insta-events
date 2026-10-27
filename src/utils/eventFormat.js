// '19:00' -> '7:00 PM'
export function to12h(time) {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12 // 0 and 12 both show as 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

// all the ways we show an event's date + time
export function eventLabels(event) {
  const day = new Date(`${event.date}T00:00`) // local midnight so the day doesn't shift
  const start = to12h(event.startTime)
  const end = to12h(event.endTime)
  const samePeriod = start.slice(-2) === end.slice(-2) // both AM or both PM
  const short = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return {
    dateLabel: day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), // Thursday, Oct 15
    shortDate: short, // Thu, Oct 15
    flyerDate: short.replace(',', '').toUpperCase(), // THU OCT 15
    startLabel: start,
    timeRange: samePeriod ? `${start.slice(0, -3)} to ${end}` : `${start} to ${end}`, // 7:00 to 8:30 PM
    shortLocation: event.location.split(',')[0], // ECSS 2.410
  }
}

// '2026-10-15' + '19:00' -> '20261015T190000' (google's format)
export function gcalStamp(date, time) {
  return `${date.replaceAll('-', '')}T${time.replace(':', '')}00`
}

// tag label falls back to a cut down title
export function shortName(title) {
  return title.length <= 14 ? title : `${title.slice(0, 13)}…`
}

// 1 calendar, 2 calendars
export function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}
