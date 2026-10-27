import Icon from '../components/Icon'
import Post from '../components/Post'

// S1: instagram home feed
export default function Feed({ posts, loading, offline, onOpenEvent, onInsights, onMore, onCreate, onAccount, onBookmark, showTip, onDismissTip, onHelp }) {
  // the tip only goes on the first post that has an event
  const tipPostId = posts.find((p) => p.event)?.id

  return (
    <div className="feed">
      <header className="ig-header">
        <h1 className="ig-logo">Instagram</h1>
        <div className="icon-row">
          {/* replays the "what's new" walkthrough */}
          <button onClick={onHelp} aria-label="How it works"><Icon name="help" size={24} /></button>
          <Icon name="heart" size={26} />
          <Icon name="send" size={24} />
        </div>
      </header>

      {/* only the middle part scrolls, header + nav stay put */}
      <div className="feed-scroll">
        {loading && <p className="feed-empty">Loading...</p>}
        {offline && (
          <p className="feed-empty">
            Can't reach the server.<br />Run <code>npm run dev</code> in the server folder, then refresh.
          </p>
        )}
        {!loading && !offline && posts.length === 0 && (
          <p className="feed-empty">No posts yet. Tap + to make one.</p>
        )}
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onOpenEvent={() => onOpenEvent(post.id)}
            onInsights={() => onInsights(post.id)}
            onBookmark={() => onBookmark(post.id)}
            onMore={() => onMore(post.id)}
            showTip={showTip && post.id === tipPostId}
            onDismissTip={onDismissTip}
          />
        ))}
      </div>

      <nav className="bottom-nav">
        <Icon name="home" size={26} />
        <Icon name="search" size={26} />
        {/* the + button starts a new post */}
        <button className="nav-create" onClick={onCreate} aria-label="New post">
          <Icon name="plus" size={26} />
        </button>
        <Icon name="reels" size={26} />
        {/* your profile pic opens calendar settings */}
        <button className="avatar small" onClick={onAccount} aria-label="Calendar settings">U</button>
      </nav>
    </div>
  )
}
