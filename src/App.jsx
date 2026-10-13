import { useState, useCallback, useEffect } from 'react'
import PhoneFrame from './components/PhoneFrame'
import Toast from './components/Toast'
import Feed from './screens/Feed'
import EventCard from './screens/EventCard'
import ConnectDialog from './screens/ConnectDialog'
import AddedSheet from './screens/AddedSheet'
import AccountSheet from './screens/AccountSheet'
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
  const [me, setMe] = useState({ connected: false }) // your google account, from the server
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

  // count an add once per post, then bump the insights numbers
  const recordAdd = useCallback((id, choice) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id || p.addedByMe) return p // not this post, or already counted
        const s = p.stats
        return {
          ...p,
          addedByMe: true,
          stats: {
            ...s,
            added: s.added + 1,
            reminders: { ...s.reminders, [choice]: s.reminders[choice] + 1 },
            addsByDay: [...s.addsByDay.slice(0, -1), s.addsByDay.at(-1) + 1], // add to today
          },
        }
      }),
    )
  }, [])

  // ---------- when the app first loads ----------
  useEffect(() => {
    // ask the server if you're signed in to google
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
        setMe(data)

        // did we just come back from google's sign in page?
        const params = new URLSearchParams(window.location.search)
        const pending = JSON.parse(sessionStorage.getItem('pendingAdd') ?? 'null')

        if (params.get('connected') === '1' && data.connected && pending) {
          // finish the add they started before leaving for google
          setActiveId(pending.postId)
          setReminder(pending.reminder)
          recordAdd(pending.postId, pending.reminder)
          setScreen('added')
        } else if (params.get('connected') === '0') {
          setToast('Google sign in was canceled')
        }

        sessionStorage.removeItem('pendingAdd')
        if (params.has('connected')) window.history.replaceState({}, '', '/') // clean up the url
      })
      .catch(() => setMe({ connected: false, offline: true })) // server isn't running
  }, [recordAdd])

  // ---------- student side ----------
  function openEvent(id) {
    setActiveId(id)
    setScreen('eventCard')
    updateStats(id, (s) => ({ ...s, tagTaps: s.tagTaps + 1 })) // counts toward insights
  }

  function handleAdd(choice) {
    setReminder(choice)
    // already signed in? one tap. if not, connect google first
    if (me.connected) {
      recordAdd(activeId, choice)
      setScreen('added')
    } else {
      setScreen('connect')
    }
  }

  function goToGoogle() {
    // the page is about to reload, so remember what they were adding
    sessionStorage.setItem('pendingAdd', JSON.stringify({ postId: activeId, reminder }))
    window.location.href = '/auth/google' // the server sends us on to google
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
          <Feed
            posts={posts}
            onOpenEvent={openEvent}
            onInsights={openInsights}
            onCreate={startPost}
            onAccount={() => setScreen('account')}
          />

          {screen === 'eventCard' && activePost && (
            <EventCard
              post={activePost}
              onClose={backToFeed}
              onAddToCalendar={handleAdd}
              alreadyAdded={activePost.addedByMe}
              savedReminder={reminder}
            />
          )}
          {screen === 'connect' && <ConnectDialog onAllow={goToGoogle} onCancel={backToFeed} />}
          {screen === 'added' && activePost && (
            <AddedSheet post={activePost} reminder={reminder} email={me.email} onDone={backToFeed} />
          )}
          {screen === 'account' && <AccountSheet me={me} onClose={backToFeed} />}
        </>
      )}

      {toast && <Toast message={toast} onDone={clearToast} />}
    </PhoneFrame>
  )
}
