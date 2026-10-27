import { useState, useCallback, useEffect } from 'react'
import PhoneFrame from './components/PhoneFrame'
import Toast from './components/Toast'
import Feed from './screens/Feed'
import EventCard from './screens/EventCard'
import ConnectDialog from './screens/ConnectDialog'
import AddedSheet from './screens/AddedSheet'
import AccountSheet from './screens/AccountSheet'
import SavePrompt from './screens/SavePrompt'
import DeletePost from './screens/DeletePost'
import Onboarding from './screens/Onboarding'
import NewPost from './screens/creator/NewPost'
import EventForm from './screens/creator/EventForm'
import ReviewPost from './screens/creator/ReviewPost'
import Insights from './screens/creator/Insights'
import { flyerColors, emptyStats } from './data/posts'
import { plural } from './utils/eventFormat'
import { downloadIcs } from './utils/icsFile'
import { getMe, getPosts, createPost, tapEventTag, countAdd, sendToGoogle, saveEvent, deletePost } from './utils/api'
import { load, save } from './utils/storage'

// a fresh, empty post being made
const blankDraft = { caption: '', imageUrl: null, event: null }

export default function App() {
  // ---------- state ----------
  const [posts, setPosts] = useState([]) // everything in the feed (loaded from the server)
  const [loading, setLoading] = useState(true) // still waiting for the feed
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

  // the server sent back a fresher copy of a post (new stats etc), swap it in
  // savedByMe (the bookmark) only lives in the browser, so keep it
  const replacePost = useCallback((fresh) => {
    setPosts((prev) => prev.map((p) => (p.id === fresh.id ? { ...fresh, savedByMe: p.savedByMe } : p)))
  }, [])

  // ask the server to put the event in their real google calendar
  const addToGoogle = useCallback(
    (post, choice) => {
      setGoogleResult({ status: 'loading' })
      setScreen('added') // shows the spinner while we wait
      sendToGoogle(post.id, choice)
        .then((data) => {
          replacePost(data.post) // new totals from the database
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
    [replacePost],
  )

  // ---------- when the app first loads ----------
  useEffect(() => {
    // ask the server who's signed in AND for the feed, at the same time
    Promise.all([getMe(), getPosts()])
      .then(([data, feed]) => {
        setMe(data)
        setPosts(feed)
        setLoading(false)

        // did we just come back from google's sign in page?
        const params = new URLSearchParams(window.location.search)
        const pending = JSON.parse(sessionStorage.getItem('pendingAdd') ?? 'null')

        if (params.get('connected') === '1' && data.connected && pending) {
          // finish the add they started before leaving for google
          // (posts are in the database now, so even brand new ones are still here)
          const post = feed.find((p) => p.id === pending.postId)
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
      .catch(() => {
        setMe({ connected: false, offline: true }) // server isn't running
        setLoading(false)
      })
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
    tapEventTag(id).then(replacePost).catch(() => {}) // counts toward insights (not a big deal if it fails)
  }

  function handleAdd(choice, cal) {
    setReminder(choice)
    changeCalendar(cal)

    // apple + outlook: download an event file, no sign in needed
    if (cal !== 'google') {
      downloadIcs(activePost, choice)
      setScreen('added')
      countAdd(activeId, choice, cal)
        .then((fresh) => replacePost({ ...fresh, addedByMe: true, addedTo: cal }))
        .catch(() => {})
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

  // what the draft looks like as a real post (the server gives it a real id when shared)
  const draftPost = {
    id: 'draft',
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
    const { id, stats, postedAgo, ...newPost } = draftPost // the server makes these
    createPost(newPost)
      .then((saved) => {
        setPosts((prev) => [saved, ...prev]) // newest on top
        setDraft(blankDraft)
        setScreen('feed')
        setToast('Posted!')
      })
      .catch(() => setToast("Couldn't post. Is the server running?"))
  }

  function openInsights(id) {
    setActiveId(id)
    setScreen('insights')
  }

  function saveEdit(event) {
    replacePost({ ...activePost, event }) // show the change right away
    setScreen('insights')
    setToast('Saving...')

    // the server saves it, then updates it in everyone's google calendar
    saveEvent(activeId, event)
      .then(({ post, updated, failed }) => {
        replacePost(post)
        if (updated > 0) setToast(`Event updated · ${plural(updated, 'Google Calendar')} updated`)
        else setToast('Event updated')
        if (failed > 0) console.warn(`${failed} calendar(s) couldn't be updated, see the server terminal`)
      })
      .catch(() => setToast("Couldn't save. Is the server running?"))
  }

  function openDelete(id) {
    setActiveId(id)
    setScreen('deletePost')
  }

  function confirmDelete() {
    const id = activeId
    setScreen('feed')
    setToast('Deleting...')
    deletePost(id)
      .then(({ removed }) => {
        setPosts((prev) => prev.filter((p) => p.id !== id)) // gone from the feed
        setToast(removed > 0 ? `Post deleted · removed from ${plural(removed, 'Google Calendar')}` : 'Post deleted')
      })
      .catch(() => setToast("Couldn't delete. Is the server running?"))
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
            loading={loading}
            offline={me.offline}
            onOpenEvent={openEvent}
            onInsights={openInsights}
            onCreate={startPost}
            onAccount={() => setScreen('account')}
            onBookmark={toggleBookmark}
            onMore={openDelete}
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
          {screen === 'deletePost' && activePost && (
            <DeletePost post={activePost} onDelete={confirmDelete} onCancel={backToFeed} />
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
