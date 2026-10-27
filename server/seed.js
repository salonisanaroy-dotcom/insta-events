// what goes in the database the very first time (it used to live in src/data/posts.js)

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString()

export const seedPosts = [
  {
    author: 'utdakpsi',
    authorInitial: 'A',
    school: 'UT Dallas',
    caption: 'First GBM of the semester! Come meet the brothers and learn about rush.',
    likes: 128,
    comments: 12,
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
    reached: 1240,
    tagTaps: 86,
    createdAt: hoursAgo(2),
  },
]

// 42 made up adds so the insights page isn't empty for the demo
// spread over the last 7 days (14 six days ago ... 1 today), same as the old numbers
const perDay = [14, 9, 6, 5, 4, 3, 1]
const reminders = [
  ...Array(28).fill('1 day before'),
  ...Array(10).fill('1 hour before'),
  ...Array(4).fill('No reminder'),
]
export const seedAdds = []
perDay.forEach((n, i) => {
  for (let k = 0; k < n; k++) {
    seedAdds.push({ reminder: reminders[seedAdds.length], addedAt: hoursAgo((6 - i) * 24 + 1) })
  }
})
