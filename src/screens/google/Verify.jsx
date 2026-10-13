import { useEffect } from 'react'
import Icon from '../../components/Icon'
import GooglePage from '../../components/GooglePage'
import { account } from '../../data/account'

// S5: 2-step verification, pretends you tapped yes on your phone
export default function Verify({ onVerified, onCancel }) {
  // auto move on after 2.5 sec
  useEffect(() => {
    const timer = setTimeout(onVerified, 2500)
    return () => clearTimeout(timer) // cleanup if they leave early
  }, [onVerified])

  return (
    <GooglePage onCancel={onCancel}>
      <h1 className="google-title">2-Step Verification</h1>
      <p className="google-sub small">
        To help keep your account safe, Google wants to make sure it's really you trying to
        sign in.
      </p>
      <span className="email-pill">
        {account.email} <Icon name="chevronDown" size={14} />
      </span>

      <h2 className="verify-heading">Check your iPhone</h2>
      {/* little phone drawing, tapping yes also works */}
      <div className="mini-phone">
        <div className="mini-notif">
          <p>Trying to sign in?</p>
          <button className="mini-yes" onClick={onVerified}>Yes</button>
        </div>
      </div>
      <p className="google-sub small">
        Google sent a notification to your iPhone. Tap <strong>Yes</strong> on the
        notification to continue.
      </p>
      <span className="g-link">Try another way</span>
    </GooglePage>
  )
}
