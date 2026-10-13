import Icon from '../components/Icon'
import EventTag from '../components/EventTag'
import { event } from '../data/event'

// S1: instagram home feed with one event post
export default function Feed({ onOpenEvent }) {
  return (
    <div className="feed">
      <header className="ig-header">
        <h1 className="ig-logo">Instagram</h1>
        <div className="icon-row">
          <Icon name="heart" size={26} />
          <Icon name="send" size={24} />
        </div>
      </header>

      <div className="post-header">
        <div className="avatar">A</div>
        <div>
          <div className="username">{event.host}</div>
          <div className="subtext">{event.hostSchool}</div>
        </div>
        <span className="more">•••</span>
      </div>

      {/* the flyer image, built with css instead of a real photo */}
      <div className="flyer">
        <p className="flyer-org">ALPHA KAPPA PSI</p>
        <h2 className="flyer-title">General Body<br />Meeting</h2>
        <p className="flyer-details">THU OCT 15 · 7 PM · {event.location}</p>
        <EventTag label={`${event.shortTitle} · ${event.shortDate}`} onClick={onOpenEvent} />
      </div>

      <div className="post-actions">
        <div className="icon-row">
          <Icon name="heart" size={26} />
          <Icon name="comment" size={24} />
          <Icon name="send" size={24} />
        </div>
        <Icon name="bookmark" size={24} />
      </div>

      <div className="post-text">
        <p className="likes">{event.likes} likes</p>
        <p><strong>{event.host}</strong> {event.caption}</p>
        <p className="subtext">View all {event.comments} comments</p>
        <p className="timestamp">{event.postedAgo}</p>
      </div>

      <nav className="bottom-nav">
        <Icon name="home" size={26} />
        <Icon name="search" size={26} />
        <Icon name="plus" size={26} />
        <Icon name="reels" size={26} />
        <div className="avatar small">U</div>
      </nav>
    </div>
  )
}
