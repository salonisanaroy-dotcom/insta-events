import { useState } from 'react'
import Icon from '../components/Icon'
import Sheet from '../components/Sheet'
import { eventLabels } from '../utils/eventFormat'
import { calendars } from '../data/calendars'

const reminderOptions = ['1 day before', '1 hour before', 'No reminder']

// S2: event details, reminder, and which calendar to add it to
export default function EventCard({ post, onClose, onAddToCalendar, savedReminder, savedCalendar }) {
  const { event, stats } = post
  const labels = eventLabels(event)
  // both start on whatever they picked last time
  const [reminder, setReminder] = useState(savedReminder)
  const [calendar, setCalendar] = useState(savedCalendar)
  const picked = calendars[calendar]

  return (
    <Sheet onClose={onClose}>
      <h2 className="sheet-title">{event.title}</h2>
      <p className="subtext">Hosted by {post.author}</p>

      <ul className="details">
        <li><Icon name="clock" size={20} /> {labels.dateLabel} · {labels.timeRange}</li>
        <li><Icon name="pin" size={20} /> {event.location}</li>
        <li className="muted"><Icon name="people" size={20} /> {stats.added} people added this event</li>
      </ul>

      <hr />

      <p className="section-label">Reminder</p>
      <div className="chips">
        {reminderOptions.map((option) => (
          <button
            key={option}
            className={option === reminder ? 'chip selected' : 'chip'}
            onClick={() => setReminder(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <p className="section-label">Add to</p>
      {/* google, apple, or outlook */}
      <div className="calendar-picker">
        {Object.entries(calendars).map(([key, cal]) => (
          <button
            key={key}
            className={key === calendar ? 'cal-option selected' : 'cal-option'}
            onClick={() => setCalendar(key)}
          >
            <Icon name="calendar" size={18} color={cal.color} />
            {cal.short}
          </button>
        ))}
      </div>

      <button
        className="btn"
        style={{ background: picked.color }}
        onClick={() => onAddToCalendar(reminder, calendar)}
      >
        <Icon name="calendar" size={20} color="white" />
        Add to {picked.name}
      </button>
    </Sheet>
  )
}
