import Icon from './Icon'

// the white pill on the flyer, tapping it opens the event card
export default function EventTag({ label, onClick }) {
  return (
    <button className="event-tag" onClick={onClick}>
      <Icon name="calendar" size={16} />
      <span>{label}</span>
      <Icon name="chevronRight" size={14} />
    </button>
  )
}
