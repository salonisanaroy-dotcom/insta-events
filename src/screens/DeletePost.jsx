
// tap ••• on a post: are you sure you want to delete it?
export default function DeletePost({ post, onDelete, onCancel }) {
  const { event, stats } = post
  // only mention calendars if people actually added it and auto updates are on
  const touchesCalendars = event?.autoUpdate && stats.added > 0

  return (
    <div className="overlay center" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="dialog-title">Delete post?</h2>
        <p className="dialog-text">
          {touchesCalendars
            ? `${stats.added === 1 ? '1 person' : `${stats.added} people`} added this event. It will also be removed from the Google Calendars it was added to.`
            : "This can't be undone."}
        </p>
        <button className="btn btn-danger" onClick={onDelete}>Delete</button>
        <button className="text-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
