import Icon from '../components/Icon'
import Sheet from '../components/Sheet'
import { event } from '../data/event'
import { account } from '../data/account'
import { googleCalendarLink } from '../utils/calendarLink'

// S7: confirmation, opens the real google calendar
export default function AddedSheet({ reminder, onDone }) {
  return (
    <Sheet onClose={onDone}>
      <div className="icon-circle green">
        <Icon name="check" size={28} color="#1e8e3e" />
      </div>
      <h2 className="center-title">Added to Google Calendar</h2>
      <p className="center-sub">{event.shortDate} · {event.startLabel} · {event.location}</p>
      <p className="center-sub">Reminder: {reminder}</p>
      <p className="calendar-pick">
        Calendar: {account.email} <Icon name="chevronDown" size={14} />
      </p>

      {/* real link, opens google calendar in a new tab */}
      <a className="btn btn-google" href={googleCalendarLink(event)} target="_blank" rel="noreferrer">
        <Icon name="calendar" size={20} color="white" />
        Open in Google Calendar
      </a>
      <button className="text-btn" onClick={onDone}>Done</button>
    </Sheet>
  )
}
