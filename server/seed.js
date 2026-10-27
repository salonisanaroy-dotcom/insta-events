// what goes in the database the very first time (it used to live in src/data/posts.js)

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString()

export const seedPosts = [
  {
    author: 'cometcoders',
    authorInitial: 'C',
    school: 'UT Dallas',
    caption: 'Hack Night is back! Bring a laptop and an idea (or just come for the pizza). All majors welcome.',
    likes: 128,
    comments: 12,
    flyerTop: 'COMET CODERS',
    flyerTitle: 'Hack\nNight',
    colors: ['#0f766e', '#2563eb'],
    event: {
      title: 'Comet Coders Hack Night',
      shortTitle: 'Hack Night',
      date: '2026-11-12',
      startTime: '19:00',
      endTime: '21:00',
      location: 'ECSS 2.410, UT Dallas',
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
