// ios style on/off switch
export default function Toggle({ on, onChange }) {
  return (
    <button
      className={on ? 'toggle on' : 'toggle'}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
    >
      <span className="knob" />
    </button>
  )
}
