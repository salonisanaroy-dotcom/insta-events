import Icon from '../../components/Icon'
import Avatar from '../../components/Avatar'
import GooglePage from '../../components/GooglePage'
import { account } from '../../data/account'

// S4: pick which google account to use
export default function ChooseAccount({ onPick, onCancel }) {
  return (
    <GooglePage onCancel={onCancel}>
      <h1 className="google-title">Choose an account</h1>
      <p className="google-sub">to continue to Instagram</p>

      <div className="account-list">
        <button className="account-row" onClick={onPick}>
          <Avatar letter={account.initial} size={36} />
          <div>
            <div className="username">{account.name}</div>
            <div className="subtext">{account.email}</div>
          </div>
        </button>
        <button className="account-row" onClick={onPick}>
          <Avatar letter={account.initial} size={36} />
          <div>
            <div className="username">{account.name}</div>
            <div className="subtext">{account.otherEmail}</div>
          </div>
        </button>
        <button className="account-row">
          <span className="row-icon"><Icon name="user" size={22} /></span>
          <div className="username">Use another account</div>
        </button>
      </div>

      <p className="google-fine">
        To continue, Google will share your name, email address, and profile picture with
        Instagram. Before using this app, review its <span className="g-link">privacy policy</span> and{' '}
        <span className="g-link">terms of service</span>.
      </p>
    </GooglePage>
  )
}
