import Icon from './Icon'
import Avatar from './Avatar'
import Flyer from './Flyer'

// one post in the feed
export default function Post({ post, onOpenEvent, onInsights, onBookmark, showTip, onDismissTip }) {
  return (
    <article className="post">
      <div className="post-header">
        <Avatar letter={post.authorInitial} />
        <div>
          <div className="username">{post.author}</div>
          <div className="subtext">{post.school}</div>
        </div>
        <span className="more">•••</span>
      </div>

      <Flyer post={post} onOpenEvent={onOpenEvent} showTip={showTip} onDismissTip={onDismissTip} />

      {/* your own posts get an insights bar, like real instagram */}
      <button className="insights-bar" onClick={onInsights}>
        <Icon name="chart" size={16} /> View insights
        <span className="insights-arrow"><Icon name="chevronRight" size={14} /></span>
      </button>

      <div className="post-actions">
        <div className="icon-row">
          <Icon name="heart" size={26} />
          <Icon name="comment" size={24} />
          <Icon name="send" size={24} />
        </div>
        {/* bookmark fills in black once saved */}
        <button onClick={onBookmark} aria-label={post.savedByMe ? 'Unsave' : 'Save'}>
          <Icon name="bookmark" size={24} fill={post.savedByMe ? 'black' : 'none'} />
        </button>
      </div>

      <div className="post-text">
        <p className="likes">{post.likes} likes</p>
        {post.caption && <p><strong>{post.author}</strong> {post.caption}</p>}
        {post.comments > 0 && <p className="subtext">View all {post.comments} comments</p>}
        <p className="timestamp">{post.postedAgo}</p>
      </div>
    </article>
  )
}
