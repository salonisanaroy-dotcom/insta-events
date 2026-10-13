import { useState } from 'react'
import PhoneFrame from './components/PhoneFrame'
import Feed from './screens/Feed'
import EventCard from './screens/EventCard'
import ConnectDialog from './screens/ConnectDialog'
import AddedSheet from './screens/AddedSheet'
import ChooseAccount from './screens/google/ChooseAccount'
import Verify from './screens/google/Verify'
import AllowAccess from './screens/google/AllowAccess'

export default function App() {
  // which screen we're on
  const [screen, setScreen] = useState('feed')
  // reminder they picked on the event card
  const [reminder, setReminder] = useState('1 day before')
  // has the student linked google yet? only need to do it once
  const [connected, setConnected] = useState(false)
  // did they add this event already
  const [added, setAdded] = useState(false)

  const backToFeed = () => setScreen('feed')

  function handleAdd(choice) {
    setReminder(choice)
    // first time goes through google sign in, after that it's one tap
    if (connected) finishAdding()
    else setScreen('connect')
  }

  function finishAdding() {
    setAdded(true)
    setScreen('added')
  }

  function handleAllow() {
    setConnected(true)
    finishAdding()
  }

  // google sign in pages take over the whole phone
  if (screen === 'chooseAccount') {
    return <PhoneFrame><ChooseAccount onPick={() => setScreen('verify')} onCancel={backToFeed} /></PhoneFrame>
  }
  if (screen === 'verify') {
    return <PhoneFrame><Verify onVerified={() => setScreen('allow')} onCancel={backToFeed} /></PhoneFrame>
  }
  if (screen === 'allow') {
    return <PhoneFrame><AllowAccess onAllow={handleAllow} onCancel={backToFeed} /></PhoneFrame>
  }

  // everything else sits on top of the feed
  return (
    <PhoneFrame>
      <Feed onOpenEvent={() => setScreen('eventCard')} />

      {screen === 'eventCard' && (
        <EventCard onClose={backToFeed} onAddToCalendar={handleAdd} alreadyAdded={added} savedReminder={reminder} />
      )}
      {screen === 'connect' && (
        <ConnectDialog onAllow={() => setScreen('chooseAccount')} onCancel={backToFeed} />
      )}
      {screen === 'added' && <AddedSheet reminder={reminder} onDone={backToFeed} />}
    </PhoneFrame>
  )
}
