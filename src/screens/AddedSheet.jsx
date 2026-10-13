import Icon from '../components/Icon'
import Sheet from '../components/Sheet'
import { eventLabels } from '../utils/eventFormat'
import { googleCalendarLink } from '../utils/calendarLink'

// S7: last step, sends you to google calendar to save the event
// (day 3 will add it for you instead)
export default function AddedSheet({ post, email, onDone }) {
  const labels = eventLabels(post.event)

  return (
    <Sheet onClose={onDone}>
      <div className="icon-circle blue">
        <Icon name="calendar" size={28} color="#1a73e8" />
      </div>
      <h2 className="center-title">Save to Google Calendar</h2>
      <p className="center-sub">{post.event.title}</p>
      <p className="center-sub">{labels.shortDate} · {labels.startLabel} · {labels.shortLocation}</p>
      <p className="calendar-pick">Calendar: {email}</p>

      {/* opens google calendar with everything filled in, you just hit save */}
      <a
        className="btn btn-google"
        href={googleCalendarLink(post)}
        target="_blank"
        rel="noreferrer"
        onClick={onDone}
      >
        <Icon name="calendar" size={20} color="white" />
        Save in Google Calendar
      </a>
      <button className="text-btn" onClick={onDone}>Not now</button>
    </Sheet>
  )
}