import { useState, useCallback } from 'react'
import PhoneFrame from './components/PhoneFrame'
import Toast from './components/Toast'
import Feed from './screens/Feed'
import EventCard from './screens/EventCard'
import ConnectDialog from './screens/ConnectDialog'
import AddedSheet from './screens/AddedSheet'
import ChooseAccount from './screens/google/ChooseAccount'
import Verify from './screens/google/Verify'
import AllowAccess from './screens/google/AllowAccess'
import NewPost from './screens/creator/NewPost'
import EventForm from './screens/creator/EventForm'
import ReviewPost from './screens/creator/ReviewPost'
import Insights from './screens/creator/Insights'
import { initialPosts, flyerColors, emptyStats } from './data/posts'
import { plural } from './utils/eventFormat'

// a fresh, empty post being made
const blankDraft = { caption: '', imageUrl: null, event: null }

export default function App() {
  // ---------- state ----------
  const [posts, setPosts] = useState(initialPosts) // everything in the feed
  const [screen, setScreen] = useState('feed') // which screen is showing
  const [activeId, setActiveId] = useState(null) // which post we're looking at
  const [reminder, setReminder] = useState('1 day before') // last reminder picked
  const [connected, setConnected] = useState(false) // linked google yet? only once
  const [addedIds, setAddedIds] = useState([]) // posts this student added
  const [draft, setDraft] = useState(blankDraft) // the post being created
  const [formReturn, setFormReturn] = useState('newPost') // where the event form goes back to
  const [toast, setToast] = useState('') // popup message at the bottom

  const activePost = posts.find((p) => p.id === activeId)
  const backToFeed = () => setScreen('feed')
  const clearToast = useCallback(() => setToast(''), []) // same function every render so the timer doesn't reset

  // change one post's stats without touching the others
  function updateStats(id, change) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, stats: change(p.stats) } : p)))
  }

  // ---------- student side ----------
  function openEvent(id) {
    setActiveId(id)
    setScreen('eventCard')
    updateStats(id, (s) => ({ ...s, tagTaps: s.tagTaps + 1 })) // counts toward insights
  }

  function handleAdd(choice) {
    setReminder(choice)
    // first time goes through google sign in, after that it's one tap
    if (connected) finishAdding(choice)
    else setScreen('connect')
  }

  function finishAdding(choice) {
    // only count it once per post
    if (!addedIds.includes(activeId)) {
      setAddedIds([...addedIds, activeId])
      updateStats(activeId, (s) => ({
        ...s,
        added: s.added + 1,
        reminders: { ...s.reminders, [choice]: s.reminders[choice] + 1 },
        addsByDay: [...s.addsByDay.slice(0, -1), s.addsByDay.at(-1) + 1], // add to today
      }))
    }
    setScreen('added')
  }

  function handleAllow() {
    setConnected(true)
    finishAdding(reminder)
  }

  // ---------- creator side ----------
  function startPost() {
    setDraft(blankDraft)
    setScreen('newPost')
  }

  function openEventForm(from) {
    setFormReturn(from) // remember where we came from
    setScreen('eventForm')
  }

  function saveDraftEvent(event) {
    setDraft({ ...draft, event })
    setScreen(formReturn)
  }

  // what the draft looks like as a real post
  const draftPost = {
    id: Date.now(),
    author: 'utdakpsi',
    authorInitial: 'A',
    school: 'UT Dallas',
    caption: draft.caption.trim(),
    likes: 0,
    comments: 0,
    postedAgo: 'Just now',
    imageUrl: draft.imageUrl,
    flyerTop: 'UTDAKPSI',
    flyerTitle: draft.event ? draft.event.title : draft.caption.slice(0, 40),
    colors: flyerColors[posts.length % flyerColors.length],
    event: draft.event,
    stats: emptyStats(),
  }

  function sharePost() {
    setPosts([draftPost, ...posts]) // newest on top
    setDraft(blankDraft)
    setScreen('feed')
    setToast('Posted!')
  }

  function openInsights(id) {
    setActiveId(id)
    setScreen('insights')
  }

  function saveEdit(event) {
    setPosts((prev) => prev.map((p) => (p.id === activeId ? { ...p, event } : p)))
    const n = activePost.stats.added
    setToast(n > 0 && event.autoUpdate ? `Event updated · ${plural(n, 'calendar')} updated` : 'Event updated')
    setScreen('insights')
  }

  // ---------- full page screens ----------
  const pages = {
    chooseAccount: <ChooseAccount onPick={() => setScreen('verify')} onCancel={backToFeed} />,
    verify: <Verify onVerified={() => setScreen('allow')} onCancel={backToFeed} />,
    allow: <AllowAccess onAllow={handleAllow} onCancel={backToFeed} />,
    newPost: (
      <NewPost
        draft={draft}
        setDraft={setDraft}
        onCancel={backToFeed}
        onAddEvent={() => openEventForm('newPost')}
        onNext={() => setScreen('review')}
      />
    ),
    eventForm: <EventForm initial={draft.event} onBack={() => setScreen(formReturn)} onSave={saveDraftEvent} />,
    review: (
      <ReviewPost
        draftPost={draftPost}
        onBack={() => setScreen('newPost')}
        onEditEvent={() => openEventForm('review')}
        onShare={sharePost}
      />
    ),
    insights: activePost && (
      <Insights post={activePost} onBack={backToFeed} onEditEvent={() => setScreen('editEvent')} />
    ),
    editEvent: activePost && (
      <EventForm
        mode="edit"
        initial={activePost.event}
        addedCount={activePost.stats.added}
        onBack={() => setScreen('insights')}
        onSave={saveEdit}
      />
    ),
  }

  return (
    <PhoneFrame>
      {pages[screen] ?? (
        // anything that isn't a full page sits on top of the feed
        <>
          <Feed posts={posts} onOpenEvent={openEvent} onInsights={openInsights} onCreate={startPost} />

          {screen === 'eventCard' && (
            <EventCard
              post={activePost}
              onClose={backToFeed}
              onAddToCalendar={handleAdd}
              alreadyAdded={addedIds.includes(activeId)}
              savedReminder={reminder}
            />
          )}
          {screen === 'connect' && (
            <ConnectDialog onAllow={() => setScreen('chooseAccount')} onCancel={backToFeed} />
          )}
          {screen === 'added' && <AddedSheet post={activePost} reminder={reminder} onDone={backToFeed} />}
        </>
      )}

      {toast && <Toast message={toast} onDone={clearToast} />}
    </PhoneFrame>
  )
}
