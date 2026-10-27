import Icon from '../components/Icon'
import Sheet from '../components/Sheet'
import { eventLabels } from '../utils/eventFormat'
import { googleCalendarLink } from '../utils/calendarLink'
import { downloadIcs } from '../utils/icsFile'

// S7: last step, different for google vs apple/outlook
export default function AddedSheet({ post, reminder, calendar, email, result, onDone }) {
  const labels = eventLabels(post.event)
  const details = `${labels.shortDate} · ${labels.startLabel} · ${labels.shortLocation}`

  // ---------- apple + outlook: we already downloaded the event file ----------
  if (calendar !== 'google') {
    const name = calendar === 'apple' ? 'Apple Calendar' : 'Outlook'
    return (
      <Sheet onClose={onDone}>
        <div className="icon-circle blue">
          <Icon name="calendar" size={28} color="#1a73e8" />
        </div>
        <h2 className="center-title">Event file downloaded</h2>
        <p className="center-sub">{post.event.title}</p>
        <p className="center-sub">{details}</p>
        <p className="center-sub">
          Open the file and tap Add to put it in {name}.
          {reminder !== 'No reminder' && ` Your reminder (${reminder}) is included.`}
        </p>
        <button className="btn btn-dark" onClick={() => downloadIcs(post, reminder)}>
          <Icon name="calendar" size={20} color="white" />
          Download again
        </button>
        <button className="text-btn" onClick={onDone}>Done</button>
      </Sheet>
    )
  }

  // ---------- google: the server is adding it ----------
  if (result.status === 'loading') {
    return (
      <Sheet onClose={onDone}>
        <div className="spinner" />
        <h2 className="center-title">Adding to Google Calendar...</h2>
        <p className="center-sub">{post.event.title}</p>
      </Sheet>
    )
  }

  // ---------- google: something went wrong, offer the old link as a backup ----------
  if (result.status === 'error') {
    return (
      <Sheet onClose={onDone}>
        <div className="icon-circle blue">
          <Icon name="calendar" size={28} color="#1a73e8" />
        </div>
        <h2 className="center-title">Couldn't add it automatically</h2>
        <p className="center-sub">You can still save it yourself in Google Calendar.</p>
        <a className="btn btn-google" href={googleCalendarLink(post)} target="_blank" rel="noreferrer" onClick={onDone}>
          <Icon name="calendar" size={20} color="white" />
          Save in Google Calendar
        </a>
        <button className="text-btn" onClick={onDone}>Not now</button>
      </Sheet>
    )
  }

  // ---------- google: it's really in their calendar now ----------
  return (
    <Sheet onClose={onDone}>
      <div className="icon-circle green">
        <Icon name="check" size={28} color="#1e8e3e" />
      </div>
      <h2 className="center-title">Added to Google Calendar</h2>
      <p className="center-sub">{post.event.title}</p>
      <p className="center-sub">{details}</p>
      <p className="center-sub">Reminder: {reminder}</p>
      <p className="calendar-pick">Calendar: {email}</p>

      {/* goes straight to the event that's already in their calendar */}
      <a className="btn btn-google" href={result.link} target="_blank" rel="noreferrer">
        <Icon name="calendar" size={20} color="white" />
        Open in Google Calendar
      </a>
      <button className="text-btn" onClick={onDone}>Done</button>
    </Sheet>
  )
}
