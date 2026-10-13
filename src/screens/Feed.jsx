import Icon from '../components/Icon'
import Post from '../components/Post'

// S1: instagram home feed
export default function Feed({ posts, onOpenEvent, onInsights, onCreate, onAccount }) {
  return (
    <div className="feed">
      <header className="ig-header">
        <h1 className="ig-logo">Instagram</h1>
        <div className="icon-row">
          <Icon name="heart" size={26} />
          <Icon name="send" size={24} />
        </div>
      </header>

      {/* only the middle part scrolls, header + nav stay put */}
      <div className="feed-scroll">
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onOpenEvent={() => onOpenEvent(post.id)}
            onInsights={() => onInsights(post.id)}
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
