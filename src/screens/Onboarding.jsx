import { useState } from 'react'
import Icon from '../components/Icon'
import EventTag from '../components/EventTag'
import { calendars } from '../data/calendars'

// the 3 cards of the "what's new" walkthrough
const slides = [
  {
    title: 'New: save events from posts',
    text: 'When a club posts an event, you can add it straight to your calendar. No more screenshots you forget about.',
    art: 'flyer',
  },
  {
    title: 'Look for the Event tag',
    text: 'Tap the tag on a flyer to see the date, time, and place.',
    art: 'tag',
  },
  {
    title: 'Pick your calendar and a reminder',
    text: "Google, Apple, or Outlook. We'll remind you before it starts.",
    note: 'Running a club? Tap + and choose Add Event when you post.',
    art: 'calendars',
  },
]

// first time "what's new" walkthrough (also opens from the ? button)
export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0)
  const slide = slides[step]
  const last = step === slides.length - 1

  return (
    <div className="onboarding">
      <button className="onboarding-skip" onClick={onFinish}>Skip</button>

      <div className="onboarding-art">
        {slide.art === 'flyer' && (
          <div className="mini-flyer">
            <p>Hack Night</p>
            <span>THU NOV 12 · 7 PM</span>
          </div>
        )}
        {slide.art === 'tag' && (
          <div className="mini-flyer">
            <p>Hack Night</p>
            <EventTag label="Hack Night · Thu, Nov 12" onClick={() => {}} pulse />
          </div>
        )}
        {slide.art === 'calendars' && (
          <div className="mini-cals">
            {Object.values(calendars).map((cal) => (
              <span key={cal.short} className="cal-option selected">
                <Icon name="calendar" size={18} color={cal.color} /> {cal.short}
              </span>
            ))}
            <span className="chip selected">1 day before</span>
          </div>
        )}
      </div>

      <h2 className="onboarding-title">{slide.title}</h2>
      <p className="onboarding-text">{slide.text}</p>
      {slide.note && <p className="onboarding-note">{slide.note}</p>}

      {/* little dots showing which card you're on */}
      <div className="dots">
        {slides.map((_, i) => (
          <span key={i} className={i === step ? 'dot active' : 'dot'} />
        ))}
      </div>

      <button className="btn btn-ig onboarding-btn" onClick={() => (last ? onFinish() : setStep(step + 1))}>
        {last ? 'Get started' : 'Next'}
      </button>
    </div>
  )
}
