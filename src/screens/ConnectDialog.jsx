import Icon from '../components/Icon'

// S3: first time only, explains what connecting does
export default function ConnectDialog({ onAllow, onCancel }) {
  return (
    <div className="overlay center" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="icon-circle blue">
          <Icon name="calendar" size={28} color="#1a73e8" />
        </div>
        <h2 className="dialog-title">Connect Google Calendar</h2>
        <p className="dialog-text">
          Instagram will add the events you save to your Google Calendar, and only those
          events.
        </p>

        <div className="account-box">
          <span className="account-lock"><Icon name="lock" size={18} /></span>
          <p className="subtext">Next, you'll sign in with Google and choose what to allow.</p>
        </div>

        {/* this leaves our app and goes to google's real sign in page */}
        <button className="btn btn-google" onClick={onAllow}>Continue with Google</button>
        <button className="text-btn" onClick={onCancel}>Not now</button>
        <p className="fine-print">You only need to do this once.</p>
      </div>
    </div>
  )
}
