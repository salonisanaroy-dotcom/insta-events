import { useState } from 'react'
import PhoneFrame from './components/PhoneFrame'
import Feed from './screens/Feed'
import EventCard from './screens/EventCard'

export default function App() {
  // which screen we're on: 'feed' or 'eventCard'
  const [screen, setScreen] = useState('feed')

  return (
    <PhoneFrame>
      {/* feed always shows, the card sits on top of it */}
      <Feed onOpenEvent={() => setScreen('eventCard')} />

      {screen === 'eventCard' && (
        <EventCard
          onClose={() => setScreen('feed')}
          onAddToCalendar={(reminder) => console.log('add to calendar with', reminder)} // wired up next step
        />
      )}
    </PhoneFrame>
  )
}
