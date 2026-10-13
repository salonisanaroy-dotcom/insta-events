import Icon from '../components/Icon'
import Sheet from '../components/Sheet'

// tap your profile pic: see which google account is connected
export default function AccountSheet({ me, onClose }) {
  return (
    <Sheet onClose={onClose}>
      <h2 className="sheet-title">Calendar settings</h2>

      {me.connected ? (
        <>
          <div className="connected-card">
            <Icon name="calendar" size={24} color="#1a73e8" />
            <div>
              <p className="username">Google Calendar</p>
              <p className="subtext">{me.email}</p>
            </div>
            <span className="connected-pill">Connected</span>
          </div>
          {/* goes to the server, which forgets your login, then comes back */}
          <a className="danger-btn" href="/auth/logout">Disconnect Google Calendar</a>
        </>
      ) : (
        <p className="subtext account-empty">
          {me.offline
            ? "Can't reach the server. Is it running?"
            : 'Not connected yet. Add an event to connect Google Calendar.'}
        </p>
      )}
    </Sheet>
  )
}
