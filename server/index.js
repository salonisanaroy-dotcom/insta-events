import express from 'express'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json()) // lets us read json the frontend sends

// quick check that the server's alive
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`))