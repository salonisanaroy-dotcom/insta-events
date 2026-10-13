// the iphone shell that every screen sits inside
export default function PhoneFrame({ children }) {
  return (
    <div className="phone">
      <div className="status-bar">
        <span>9:41</span>
        <span className="battery" />
      </div>
      <div className="screen">{children}</div>
      <div className="home-indicator" />
    </div>
  )
}
