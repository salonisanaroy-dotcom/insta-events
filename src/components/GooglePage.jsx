import Icon from './Icon'

// shared layout for the fake google sign in pages (S4 to S6)
// click-through only, no real email or password boxes
export default function GooglePage({ onCancel, children }) {
  return (
    <div className="google-page">
      <div className="browser-bar">
        <button className="browser-cancel" onClick={onCancel}>Cancel</button>
        <span className="browser-url">
          <Icon name="lock" size={13} /> accounts.google.com
        </span>
      </div>
      <div className="google-content">
        <div className="google-brand">
          <Icon name="calendar" size={32} color="#1a73e8" />
          <span>Google</span>
        </div>
        {children}
      </div>
    </div>
  )
}
