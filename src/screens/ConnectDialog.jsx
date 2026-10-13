import Icon from '../components/Icon'
import Avatar from '../components/Avatar'
import { account } from '../data/account'

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
          Instagram will add events you save to your Google Calendar. It can't see or
          change your other events.
        </p>

        <div className="account-box">
          <Avatar letter={account.initial} size={36} />
          <div>
            <div className="username">{account.name}</div>
            <div className="subtext">{account.email}</div>
          </div>
          <span className="account-lock"><Icon name="lock" size={16} /></span>
        </div>

        <button className="btn btn-google" onClick={onAllow}>Allow</button>
        <button className="text-btn" onClick={onCancel}>Not now</button>
        <p className="fine-print">You only need to do this once.</p>
      </div>
    </div>
  )
}
