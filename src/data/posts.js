// the starting posts now live in the database (server/seed.js)

// gradient colors for new posts without a photo
export const flyerColors = [
  ['#b0306a', '#f58529'],
  ['#11998e', '#2f6fdb'],
  ['#4b1e78', '#dd2a7b'],
]

// blank stats for the preview of a brand new post
export const emptyStats = () => ({
  reached: 0,
  tagTaps: 0,
  added: 0,
  reminders: { '1 day before': 0, '1 hour before': 0, 'No reminder': 0 },
  addsByDay: [0, 0, 0, 0, 0, 0, 0],
})
