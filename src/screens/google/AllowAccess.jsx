import Icon from '../../components/Icon'
import Avatar from '../../components/Avatar'
import GooglePage from '../../components/GooglePage'
import { account } from '../../data/account'

// S6: google shows exactly what instagram gets access to
export default function AllowAccess({ onAllow, onCancel }) {
  return (
    <GooglePage onCancel={onCancel}>
      <h1 className="google-title">Instagram wants to access your Google Account</h1>
      <span className="email-pill">
        <Avatar letter={account.initial} size={20} /> {account.email}
      </span>

      <p className="allow-label">This will allow Instagram to:</p>
      <ul className="permission-list">
        <li><Icon name="calendar" size={22} /> <span>View and edit events Instagram adds to your calendars</span> <Icon name="info" size={18} /></li>
        <li><Icon name="doc" size={22} /> <span>See the list of your calendars</span> <Icon name="info" size={18} /></li>
      </ul>

      <hr />
      <p className="allow-label">Make sure you trust Instagram</p>
      <p className="google-fine">
        You may be sharing sensitive info with this app. You can always see or remove access
        in your Google Account.
      </p>

      <div className="google-actions">
        <button className="g-link big" onClick={onCancel}>Cancel</button>
        <button className="btn btn-google small" onClick={onAllow}>Allow</button>
      </div>
    </GooglePage>
  )
}
