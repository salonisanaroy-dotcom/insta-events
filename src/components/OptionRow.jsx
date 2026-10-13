import Icon from './Icon'

// one row in the new post options list
export default function OptionRow({ icon, label, onClick, highlight, badge }) {
  return (
    <button className={highlight ? 'option-row highlight' : 'option-row'} onClick={onClick}>
      <Icon name={icon} size={22} />
      <span>{label}</span>
      {badge && <span className="badge">{badge}</span>}
      <span className="option-arrow"><Icon name="chevronRight" size={18} /></span>
    </button>
  )
}
