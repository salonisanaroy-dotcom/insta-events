import Icon from '../../components/Icon'
import Avatar from '../../components/Avatar'
import Flyer from '../../components/Flyer'
import PageHeader from '../../components/PageHeader'
import { eventLabels } from '../../utils/eventFormat'

// C3: last look before posting
export default function ReviewPost({ draftPost, onBack, onEditEvent, onShare }) {
  const { event } = draftPost
  const labels = event ? eventLabels(event) : null

  return (
    <div className="page">
      <PageHeader title="New post" onBack={onBack} />

      <div className="page-body no-pad">
        <div className="post-header">
          <Avatar letter={draftPost.authorInitial} />
          <div>
            <div className="username">{draftPost.author}</div>
            <div className="subtext">{draftPost.school}</div>
          </div>
        </div>
        {/* tapping the tag here does nothing, it's just a preview */}
        <Flyer post={draftPost} onOpenEvent={() => {}} />
        {draftPost.caption && (
          <p className="review-caption"><strong>{draftPost.author}</strong> {draftPost.caption}</p>
        )}

        {event && (
          <div className="summary-card">
            <Icon name="calendar" size={22} />
            <div>
              <p className="username">{labels.shortDate} · {labels.timeRange}</p>
              <p className="subtext">
                {labels.shortLocation} · Calendar adds {event.allowAdds ? 'on' : 'off'}
              </p>
            </div>
            <button className="summary-edit" onClick={onEditEvent}>Edit</button>
          </div>
        )}
      </div>

      <div className="page-footer">
        <button className="btn btn-ig" onClick={onShare}>Share</button>
      </div>
    </div>
  )
}
