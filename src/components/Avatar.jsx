// purple circle with a letter
export default function Avatar({ letter, size = 34 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {letter}
    </div>
  )
}
