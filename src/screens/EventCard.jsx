import { useState } from 'react'
import Icon from '../components/Icon'
import Sheet from '../components/Sheet'
import { eventLabels } from '../utils/eventFormat'

const reminderOptions = ['1 day before', '1 hour before', 'No reminder']

// S2: event details + reminder + add button
export default function EventCard({ post, onClose, onAddToCalendar, alreadyAdded, savedReminder }) {
  const { event, stats } = post
  const labels = eventLabels(event)
  // which reminder chip is picked, starts on whatever they picked last time
  const [reminder, setReminder] = useState(savedReminder)

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
        <Icon name={alreadyAdded ? 'check' : 'calendar'} size={20} color="white" />
        {alreadyAdded ? 'Added to Google Calendar' : 'Add to Google Calendar'}
      </button>
      <button className="link-btn">Other calendars (Apple, Outlook)</button>
    </Sheet>
  )
}
