import Icon from '../../components/Icon'
import PageHeader from '../../components/PageHeader'
import OptionRow from '../../components/OptionRow'
import { eventLabels } from '../../utils/eventFormat'

// C1: start a post, pick a photo, write a caption, add an event
export default function NewPost({ draft, setDraft, onCancel, onAddEvent, onNext }) {
  // turn the picked file into a temporary url the browser can show
  function handlePhoto(e) {
    const file = e.target.files[0]
    if (file) setDraft({ ...draft, imageUrl: URL.createObjectURL(file) })
  }

  const eventLabel = draft.event
    ? `${draft.event.shortTitle} · ${eventLabels(draft.event).shortDate}`
    : 'Add Event'

  return (
    <div className="page">
      <PageHeader
        title="New post"
        onBack={onCancel}
        rightLabel="Next"
        onRight={onNext}
        rightDisabled={!draft.caption.trim() && !draft.event} // need something to post
      />

      <div className="page-body no-pad">
        <div className="new-post-top">
          {/* label wraps a hidden file input, so clicking the box opens the picker */}
          <label className="photo-pick">
            {draft.imageUrl ? (
              <img src={draft.imageUrl} alt="" />
            ) : (
              <span><Icon name="image" size={22} /><br />Add photo</span>
            )}
            <input type="file" accept="image/*" hidden onChange={handlePhoto} />
          </label>
          <textarea
            className="caption-input"
            placeholder="Write a caption..."
            value={draft.caption}
            onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
          />
        </div>

        <OptionRow icon="people" label="Tag people" />
        <OptionRow icon="pin" label="Add location" />
        <OptionRow
          icon="calendar"
          label={eventLabel}
          highlight
          badge={draft.event ? null : 'NEW'}
          onClick={onAddEvent}
        />
        <OptionRow icon="music" label="Add music" />
        <OptionRow icon="eye" label="Audience" />

        <div className="tip">
          <Icon name="calendar" size={20} />
          <p>Add Event lets students save this post straight to their Google Calendar in one tap.</p>
        </div>
      </div>
    </div>
  )
}
