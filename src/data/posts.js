// starting posts in the feed (backend will replace this later)
export const initialPosts = [
  {
    id: 1,
    author: 'utdakpsi',
    authorInitial: 'A',
    school: 'UT Dallas',
    caption: 'First GBM of the semester! Come meet the brothers and learn about rush.',
    likes: 128,
    comments: 12,
    postedAgo: '2 hours ago',
    imageUrl: null, // no photo, so we draw the flyer with css
    flyerTop: 'ALPHA KAPPA PSI',
    flyerTitle: 'General Body\nMeeting',
    colors: ['#4b1e78', '#2f6fdb'],
    event: {
      title: 'AKPsi General Body Meeting',
      shortTitle: 'GBM',
      date: '2026-10-15',
      startTime: '19:00',
      endTime: '20:30',
      location: 'JSOM 1.118, UT Dallas',
      allowAdds: true,
      autoUpdate: true,
    },
    stats: {
      reached: 1240,
      tagTaps: 86,
      added: 42,
      reminders: { '1 day before': 28, '1 hour before': 10, 'No reminder': 4 },
      addsByDay: [14, 9, 6, 5, 4, 3, 1], // oldest day first
    },
  },
]

// gradient colors for new posts without a photo
export const flyerColors = [
  ['#b0306a', '#f58529'],
  ['#11998e', '#2f6fdb'],
  ['#4b1e78', '#dd2a7b'],
]

// blank stats for a brand new post
export const emptyStats = () => ({
  reached: 0,
  tagTaps: 0,
  added: 0,
  reminders: { '1 day before': 0, '1 hour before': 0, 'No reminder': 0 },
  addsByDay: [0, 0, 0, 0, 0, 0, 0],
})
