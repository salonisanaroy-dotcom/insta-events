import Icon from '../components/Icon'
import Sheet from '../components/Sheet'
import { calendars } from '../data/calendars'

// tap your profile pic: default calendar, google connection, walkthrough
export default function AccountSheet({ me, calendar, onChangeCalendar, onReplay, onClose }) {
  return (
    <Sheet onClose={onClose}>
      <h2 className="sheet-title">Calendar settings</h2>

      <p className="section-label settings-label">Default calendar</p>
      <div className="calendar-picker">
        {Object.entries(calendars).map(([key, cal]) => (
          <button
            key={key}
            className={key === calendar ? 'cal-option selected' : 'cal-option'}
            onClick={() => onChangeCalendar(key)}
          >
            <Icon name="calendar" size={18} color={cal.color} />
            {cal.short}
          </button>
        ))}
      </div>

      <p className="section-label settings-label">Google account</p>
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
          {/* goes to the server, which ends this browser's session, then comes back */}
          <a className="danger-btn" href="/auth/logout">Sign out</a>
        </>
      ) : (
        <p className="subtext account-empty">
          {me.offline
            ? "Can't reach the server. Is it running?"
            : "Not connected. You'll connect the first time you add to Google Calendar."}
        </p>
      )}

      <button className="text-btn" onClick={onReplay}>See how it works</button>
    </Sheet>
  )
}
