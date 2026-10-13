import Icon from '../../components/Icon'
import PageHeader from '../../components/PageHeader'
import { eventLabels } from '../../utils/eventFormat'

// C4: stats for the organizer, totals only
export default function Insights({ post, onBack, onEditEvent }) {
  const { stats, event } = post
  const biggest = Math.max(...stats.addsByDay, 1) // so bars scale, and never divide by 0

  // labels for the last 7 days, ending today
  const days = stats.addsByDay.map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)
  })

  return (
    <div className="page">
      <PageHeader title="Post insights" onBack={onBack} />

      <div className="page-body">
        <div className="insights-top">
          <div
            className="insights-thumb"
            style={
              post.imageUrl
                ? { backgroundImage: `url(${post.imageUrl})` }
                : { background: `linear-gradient(90deg, ${post.colors[0]}, ${post.colors[1]})` }
            }
          />
          <div>
            <p className="username">{event ? event.title : 'Post'}</p>
            <p className="subtext">
              Posted {post.postedAgo}{event && ` · Event ${eventLabels(event).shortDate}`}
            </p>
          </div>
        </div>

        <div className="stat-row">
          <Stat number={stats.reached.toLocaleString()} label="Accounts reached" />
          <Stat number={stats.tagTaps} label="Event tag taps" />
          <Stat number={stats.added} label="Added to calendar" blue />
        </div>

        {event && (
          <>
            <p className="section-label">Calendar adds by day</p>
            <div className="bar-chart">
              {stats.addsByDay.map((count, i) => (
                <div key={i} className="bar-col">
                  <span className="bar-count">{count}</span>
                  <div className="bar" style={{ height: `${(count / biggest) * 110}px` }} />
                  <span className="bar-day">{days[i]}</span>
                </div>
              ))}
            </div>

            <p className="section-label">Reminders people chose</p>
            {Object.entries(stats.reminders).map(([name, count]) => (
              <div key={name} className="reminder-row">
                <span>{name}</span>
                <strong>{count}</strong>
              </div>
            ))}

            <div className="privacy-note">
              <Icon name="lock" size={18} />
              <p>You only see totals, never who added your event.</p>
            </div>
          </>
        )}
      </div>

      {event && (
        <div className="page-footer">
          <button className="btn btn-ig" onClick={onEditEvent}>Edit event</button>
        </div>
      )}
    </div>
  )
}

function Stat({ number, label, blue }) {
  return (
    <div className="stat">
      <p className={blue ? 'stat-number blue' : 'stat-number'}>{number}</p>
      <p className="stat-label">{label}</p>
    </div>
  )
}
