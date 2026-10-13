import EventTag from './EventTag'
import { eventLabels } from '../utils/eventFormat'

// the post image: a real photo if there is one, otherwise a css flyer
export default function Flyer({ post, onOpenEvent, small = false }) {
  const { event } = post
  const labels = event ? eventLabels(event) : null
  const gradient = { background: `linear-gradient(90deg, ${post.colors[0]}, ${post.colors[1]})` }

  return (
    <div className={small ? 'flyer small' : 'flyer'} style={post.imageUrl ? undefined : gradient}>
      {post.imageUrl ? (
        <img className="flyer-img" src={post.imageUrl} alt="" />
      ) : (
        <div className="flyer-text">
          <p className="flyer-org">{post.flyerTop}</p>
          <h2 className="flyer-title">{post.flyerTitle}</h2>
          {labels && (
            <p className="flyer-details">
              {labels.flyerDate} · {labels.startLabel} · {labels.shortLocation}
            </p>
          )}
        </div>
      )}

      {/* only posts with an event get the tag */}
      {event && <EventTag label={`${event.shortTitle} · ${labels.shortDate}`} onClick={onOpenEvent} />}
    </div>
  )
}
