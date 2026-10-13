import Icon from './Icon'

// back arrow, centered title, optional blue button on the right
export default function PageHeader({ title, onBack, rightLabel, onRight, rightDisabled }) {
  return (
    <header className="page-header">
      <button className="header-back" onClick={onBack} aria-label="Back">
        <Icon name="chevronLeft" size={26} />
      </button>
      <h1 className="page-title">{title}</h1>
      {rightLabel && (
        <button className="header-action" onClick={onRight} disabled={rightDisabled}>
          {rightLabel}
        </button>
      )}
    </header>
  )
}
