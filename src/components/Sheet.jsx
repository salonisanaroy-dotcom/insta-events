// bottom sheet that slides up over whatever's behind it
export default function Sheet({ onClose, children }) {
  return (
    // clicking the dark area closes it
    <div className="overlay" onClick={onClose}>
      {/* stopPropagation so clicks inside don't close it */}
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        {children}
      </div>
    </div>
  )
}
