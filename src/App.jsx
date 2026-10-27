import { useState, useCallback, useEffect } from 'react'
import PhoneFrame from './components/PhoneFrame'
import Toast from './components/Toast'
import Feed from './screens/Feed'
import EventCard from './screens/EventCard'
import ConnectDialog from './screens/ConnectDialog'
import AddedSheet from './screens/AddedSheet'
import AccountSheet from './screens/AccountSheet'
import SavePrompt from './screens/SavePrompt'
import Onboarding from './screens/Onboarding'
import NewPost from './screens/creator/NewPost'
import EventForm from './screens/creator/EventForm'
import ReviewPost from './screens/creator/ReviewPost'
import Insights from './screens/creator/Insights'
import { initialPosts, flyerColors, emptyStats } from './data/posts'
import { plural } from './utils/eventFormat'
import { downloadIcs } from './utils/icsFile'
import { sendToGoogle, updateInGoogle } from './utils/api'
import { load, save } from './utils/storage'

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
  const [googleResult, setGoogleResult] = useState({ status: 'loading' }) // how the google add went
  const [calendar, setCalendar] = useState(() => load('calendar', 'google')) // google, apple, or outlook
  const [showIntro, setShowIntro] = useState(() => !load('seenIntro', false)) // first visit walkthrough
  const [showTip, setShowTip] = useState(() => !load('seenTip', false)) // tooltip on the first event tag

  const activePost = posts.find((p) => p.id === activeId)
  const backToFeed = () => setScreen('feed')
  const clearToast = useCallback(() => setToast(''), []) // same function every render so the timer doesn't reset

  // change one post's stats without touching the others
  function updateStats(id, change) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, stats: change(p.stats) } : p)))
  }

  // count an add once per post, then bump the insights numbers
  const recordAdd = useCallback((id, choice, cal) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id || p.addedByMe) return p // not this post, or already counted
        const s = p.stats
        return {
          ...p,
          addedByMe: true,
          addedTo: cal, // google, apple, or outlook (so edits know to update google)
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

  // ask the server to put the event in their real google calendar
  const addToGoogle = useCallback(
    (post, choice) => {
      setGoogleResult({ status: 'loading' })
      setScreen('added') // shows the spinner while we wait
      sendToGoogle(post, choice)
        .then((data) => {
          recordAdd(post.id, choice, 'google')
          setGoogleResult({ status: 'done', link: data.link })
        })
        .catch((err) => {
          if (err.notConnected) {
            // their login is gone, so connect again
            setMe({ connected: false })
            setScreen('connect')
          } else {
            setGoogleResult({ status: 'error' })
          }
        })
    },
    [recordAdd],
  )

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
          // (new posts don't survive the reload yet, so look in the starting posts)
          const post = initialPosts.find((p) => p.id === pending.postId)
          if (post) {
            setActiveId(post.id)
            setReminder(pending.reminder)
            setCalendar('google')
            addToGoogle(post, pending.reminder)
          } else {
            setToast('Connected to Google Calendar')
          }
        } else if (params.get('connected') === '0') {
          setToast('Google sign in was canceled')
        }

        sessionStorage.removeItem('pendingAdd')
        if (params.has('connected')) window.history.replaceState({}, '', '/') // clean up the url
      })
      .catch(() => setMe({ connected: false, offline: true })) // server isn't running
  }, [addToGoogle])

  // ---------- first time help ----------
  function finishIntro() {
    setShowIntro(false)
    save('seenIntro', true) // don't show it again next visit
  }

  function replayIntro() {
    setScreen('feed')
    setShowIntro(true)
    setShowTip(true) // bring the tooltip back too
    save('seenTip', false)
  }

  function dismissTip() {
    setShowTip(false)
    save('seenTip', true)
  }

  function changeCalendar(key) {
    setCalendar(key)
    save('calendar', key) // remember their pick for next time
  }

  // ---------- student side ----------
  function openEvent(id) {
    if (showTip) dismissTip() // they found the tag, tip did its job
    setActiveId(id)
    setScreen('eventCard')
    updateStats(id, (s) => ({ ...s, tagTaps: s.tagTaps + 1 })) // counts toward insights
  }

  function handleAdd(choice, cal) {
    setReminder(choice)
    changeCalendar(cal)

    // apple + outlook: download an event file, no sign in needed
    if (cal !== 'google') {
      downloadIcs(activePost, choice)
      recordAdd(activeId, choice, cal)
      setScreen('added')
      return
    }

    // google: already signed in? the server adds it right away. if not, connect first
    if (me.connected) {
      addToGoogle(activePost, choice)
    } else {
      setScreen('connect')
    }
  }

  // bookmark a post, and nudge them if it has an event
  function toggleBookmark(id) {
    const post = posts.find((p) => p.id === id)
    const nowSaved = !post.savedByMe
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, savedByMe: nowSaved } : p)))
    if (nowSaved && post.event && !post.addedByMe) {
      setActiveId(id)
      setScreen('savePrompt')
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
    const updated = { ...activePost, event }
    setPosts((prev) => prev.map((p) => (p.id === activeId ? updated : p)))
    const n = activePost.stats.added
    setToast(n > 0 && event.autoUpdate ? `Event updated · ${plural(n, 'calendar')} updated` : 'Event updated')
    setScreen('insights')

    // if you added it to google yourself, really update it there too
    if (event.autoUpdate && updated.addedTo === 'google') {
      updateInGoogle(updated).catch(() => setToast("Event updated, but your Google Calendar couldn't be updated"))
    }
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
            onBookmark={toggleBookmark}
            showTip={showTip && !showIntro && screen === 'feed'} // hide it under pop-ups
            onDismissTip={dismissTip}
            onHelp={replayIntro}
          />

          {screen === 'eventCard' && activePost && (
            <EventCard
              post={activePost}
              onClose={backToFeed}
              onAddToCalendar={handleAdd}
              savedReminder={reminder}
              savedCalendar={calendar}
            />
          )}
          {screen === 'connect' && <ConnectDialog onAllow={goToGoogle} onCancel={backToFeed} />}
          {screen === 'added' && activePost && (
            <AddedSheet
              post={activePost}
              reminder={reminder}
              calendar={calendar}
              email={me.email}
              result={googleResult}
              onDone={backToFeed}
            />
          )}
          {screen === 'account' && (
            <AccountSheet
              me={me}
              calendar={calendar}
              onChangeCalendar={changeCalendar}
              onReplay={replayIntro}
              onClose={backToFeed}
            />
          )}
          {screen === 'savePrompt' && activePost && (
            <SavePrompt
              post={activePost}
              onAdd={() => {
                if (showTip) dismissTip() // they're adding it, no need for the tip
                setScreen('eventCard')
              }}
              onClose={backToFeed}
            />
          )}
        </>
      )}

      {/* walkthrough sits on top of everything */}
      {showIntro && <Onboarding onFinish={finishIntro} />}

      {toast && <Toast message={toast} onDone={clearToast} />}
    </PhoneFrame>
  )
}
