import Icon from '../components/Icon'
import Sheet from '../components/Sheet'

// shows up when you bookmark a post that has an event
// (people told us they hit save on flyers, then forget)
export default function SavePrompt({ post, onAdd, onClose }) {
  return (
    <Sheet onClose={onClose}>
      <div className="icon-circle blue">
        <Icon name="bookmark" size={26} color="#1a73e8" />
      </div>
      <h2 className="center-title">Saved to your collection</h2>
      <p className="center-sub">
        Want a reminder too? Add {post.event.title} to your calendar so you don't forget it.
      </p>
      <button className="btn btn-ig prompt-btn" onClick={onAdd}>
        <Icon name="calendar" size={20} color="white" />
        Add to calendar
      </button>
      <button className="text-btn" onClick={onClose}>Not now</button>
    </Sheet>
  )
}
