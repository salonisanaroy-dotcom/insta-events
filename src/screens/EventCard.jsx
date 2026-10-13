import { useState } from 'react'
import Icon from '../components/Icon'
import { event } from '../data/event'

const reminderOptions = ['1 day before', '1 hour before', 'No reminder']

// S2: bottom sheet that slides up over the feed
export default function EventCard({ onClose, onAddToCalendar }) {
  // which reminder chip is picked, starts on 1 day before
  const [reminder, setReminder] = useState('1 day before')

  return (
    // clicking the dark area closes the card
    <div className="overlay" onClick={onClose}>
      {/* stopPropagation so clicks inside the card don't close it */}
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <h2 className="sheet-title">{event.title}</h2>
        <p className="subtext">Hosted by {event.host}</p>

        <ul className="details">
          <li><Icon name="clock" size={20} /> {event.dateLabel} · {event.time}</li>
          <li><Icon name="pin" size={20} /> {event.locationFull}</li>
          <li className="muted"><Icon name="people" size={20} /> {event.addedCount} people added this event</li>
        </ul>

        <hr />

        <p className="section-label">Google Calendar reminder</p>
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

        <button className="btn btn-google" onClick={() => onAddToCalendar(reminder)}>
          <Icon name="calendar" size={20} color="white" />
          Add to Google Calendar
        </button>
        <button className="link-btn">Other calendars (Apple, Outlook)</button>
      </div>
    </div>
  )
}
