// QuizHub server. Everything is in this one file so you can read it top to bottom.
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const PORT = process.env.PORT || 4000
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const SECONDS_PER_QUESTION = 30
const GRACE_SECONDS = 15 // allowance for network delay before answers count as "too late"

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('Set the JWT_SECRET environment variable before starting in production')
}

// ---------- Database (a single SQLite file) ----------
const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dbFile = process.env.DB_PATH || path.join(projectRoot, 'data', 'quiz.db')
fs.mkdirSync(path.dirname(dbFile), { recursive: true })

const db = new DatabaseSync(dbFile)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
  );
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    difficulty TEXT,
    question TEXT,
    options TEXT,
    correct_index INTEGER
  );
  CREATE TABLE IF NOT EXISTS attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    category TEXT,
    difficulty TEXT,
    total INTEGER,
    correct INTEGER,
    percent INTEGER,
    time_taken INTEGER,
    overtime INTEGER,
    review TEXT,
    created_at TEXT
  );
`)

// Create the admin account the first time the server starts
const adminEmail = process.env.ADMIN_EMAIL || 'admin@quiz.com'
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
if (!db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail)) {
  db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)')
    .run(crypto.randomUUID(), 'Admin', adminEmail, bcrypt.hashSync(adminPassword, 10), 'admin')
}

// Quizzes in progress. They hold the correct answers, so they stay on the server.
const activeQuizzes = new Map()

// ---------- Small helpers ----------
function makeSession(user) {
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, SECRET, { expiresIn: '7d' })
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
}

// Checks the login token. Puts the logged-in user on req.user.
function requireLogin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  let user
  try {
    user = jwt.verify(token, SECRET)
  } catch {
    return res.status(401).json({ message: 'Please log in again' })
  }
  req.user = user
  next()
}

function requireAdmin(req, res, next) {
  requireLogin(req, res, () => {
    if (req.user.role === 'admin') return next()
    res.status(403).json({ message: 'Admins only' })
  })
}

function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }
  return copy
}

// ---------- Open Trivia DB (the external question API) ----------
// encode=url3986 returns text that decodeURIComponent can read, so no HTML entities to fix
const decode = (text) => decodeURIComponent(text)

async function getApiCategories() {
  const response = await fetch('https://opentdb.com/api_category.php')
  const data = await response.json()
  return data.trivia_categories
}

async function getApiQuestions(category, difficulty, amount) {
  const apiCategories = await getApiCategories()
  let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple&encode=url3986`

  if (category) {
    const match = apiCategories.find((c) => c.name === category)
    if (!match) return [] // this category only exists in our own question bank
    url += `&category=${match.id}`
  }
  if (difficulty) url += `&difficulty=${difficulty}`

  const response = await fetch(url)
  const data = await response.json()
  if (data.response_code !== 0) return [] // the API has no questions for this filter

  return data.results.map((item) => {
    const correct = decode(item.correct_answer)
    const options = shuffle([correct, ...item.incorrect_answers.map(decode)])
    return {
      question: decode(item.question),
      category: decode(item.category),
      difficulty: item.difficulty,
      options,
      correctIndex: options.indexOf(correct),
    }
  })
}

// ---------- The web server ----------
const app = express()
app.use(express.json())

// Login & register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Fill in every field. The password needs 6 or more characters.' })
  }

  const cleanEmail = email.trim().toLowerCase()
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail)) {
    return res.status(400).json({ message: 'This email is already registered' })
  }

  const user = { id: crypto.randomUUID(), name: name.trim(), email: cleanEmail, role: 'user' }
  db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)')
    .run(user.id, user.name, user.email, bcrypt.hashSync(password, 10), user.role)
  res.json(makeSession(user))
})

app.post('/api/login', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase()
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !bcrypt.compareSync(req.body.password || '', user.password)) {
    return res.status(401).json({ message: 'Wrong email or password' })
  }
  res.json(makeSession(user))
})

// Categories (from the API plus any categories admins added)
app.get('/api/categories', requireLogin, async (req, res) => {
  let apiNames
  try {
    apiNames = (await getApiCategories()).map((c) => c.name)
  } catch {
    apiNames = [] // API is down: use only our own categories
  }
  const ownNames = db.prepare('SELECT DISTINCT category FROM questions').all().map((row) => row.category)
  res.json([...new Set([...apiNames, ...ownNames])].sort())
})

// Start a quiz: build the question list and keep the answers on the server
app.post('/api/quiz/start', requireLogin, async (req, res) => {
  const category = req.body.category || ''
  const difficulty = req.body.difficulty || ''
  const amount = Math.min(Number(req.body.amount) || 10, 20)

  let apiQuestions
  try {
    apiQuestions = await getApiQuestions(category, difficulty, amount)
  } catch {
    apiQuestions = [] // API unavailable: fall back to our own questions
  }

  let sql = 'SELECT * FROM questions WHERE 1 = 1'
  const values = []
  if (category) { sql += ' AND category = ?'; values.push(category) }
  if (difficulty) { sql += ' AND difficulty = ?'; values.push(difficulty) }
  const ownQuestions = db.prepare(sql).all(...values).map((row) => ({
    question: row.question,
    category: row.category,
    difficulty: row.difficulty,
    options: JSON.parse(row.options),
    correctIndex: row.correct_index,
  }))

  const questions = shuffle([...apiQuestions, ...ownQuestions])
    .slice(0, amount)
    .map((q) => ({ ...q, id: crypto.randomUUID() }))

  if (questions.length === 0) {
    return res.status(404).json({ message: 'No questions found for these filters. Try different ones.' })
  }

  const quizId = crypto.randomUUID()
  const timeLimit = questions.length * SECONDS_PER_QUESTION
  activeQuizzes.set(quizId, {
    userId: req.user.id,
    userName: req.user.name,
    category: category || 'Any',
    difficulty: difficulty || 'any',
    questions,
    timeLimit,
    startedAt: Date.now(),
  })

  // Send the questions WITHOUT the correct answers
  res.json({
    quizId,
    timeLimit,
    questions: questions.map((q) => ({
      id: q.id,
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      options: q.options,
    })),
  })
})

// Score the quiz on the server
app.post('/api/quiz/submit', requireLogin, (req, res) => {
  const quiz = activeQuizzes.get(req.body.quizId)
  if (!quiz || quiz.userId !== req.user.id) {
    return res.status(404).json({ message: 'Quiz not found' })
  }
  activeQuizzes.delete(req.body.quizId) // a quiz can only be submitted once

  const elapsed = Math.round((Date.now() - quiz.startedAt) / 1000)
  const overtime = elapsed > quiz.timeLimit + GRACE_SECONDS
  const answers = overtime ? {} : (req.body.answers || {})

  let correct = 0
  const review = quiz.questions.map((q) => {
    const chosen = answers[q.id]
    const answered = Number.isInteger(chosen) && chosen >= 0 && chosen < q.options.length
    const isCorrect = answered && chosen === q.correctIndex
    if (isCorrect) correct++
    return {
      question: q.question,
      options: q.options,
      chosenIndex: answered ? chosen : null,
      correctIndex: q.correctIndex,
      isCorrect,
    }
  })

  const total = quiz.questions.length
  const attempt = {
    id: crypto.randomUUID(),
    percent: Math.round((correct / total) * 100),
    timeTaken: Math.min(elapsed, quiz.timeLimit),
    createdAt: new Date().toISOString(),
  }

  db.prepare(`INSERT INTO attempts
    (id, user_id, user_name, category, difficulty, total, correct, percent, time_taken, overtime, review, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(attempt.id, req.user.id, quiz.userName, quiz.category, quiz.difficulty, total, correct,
      attempt.percent, attempt.timeTaken, overtime ? 1 : 0, JSON.stringify(review), attempt.createdAt)

  res.json({ id: attempt.id })
})

// Attempts (history and results)
const toSummary = (row) => ({
  id: row.id,
  category: row.category,
  difficulty: row.difficulty,
  total: row.total,
  correct: row.correct,
  percent: row.percent,
  timeTaken: row.time_taken,
  createdAt: row.created_at,
})

app.get('/api/attempts/mine', requireLogin, (req, res) => {
  const rows = db.prepare('SELECT * FROM attempts WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)
  res.json(rows.map(toSummary))
})

app.get('/api/attempts/:id', requireLogin, (req, res) => {
  const row = db.prepare('SELECT * FROM attempts WHERE id = ?').get(req.params.id)
  if (!row || (row.user_id !== req.user.id && req.user.role !== 'admin')) {
    return res.status(404).json({ message: 'Result not found' })
  }
  const average = db.prepare('SELECT AVG(percent) AS avg FROM attempts WHERE user_id = ? AND id != ?')
    .get(row.user_id, row.id)

  res.json({
    ...toSummary(row),
    userName: row.user_name,
    overtime: row.overtime === 1,
    review: JSON.parse(row.review),
    previousAverage: average.avg === null ? null : Math.round(average.avg),
  })
})

// Leaderboard: top 10 players
app.get('/api/leaderboard', requireLogin, (req, res) => {
  const rows = db.prepare(`
    SELECT user_id, user_name, MAX(percent) AS best, ROUND(AVG(percent)) AS average,
           COUNT(*) AS quizzes, SUM(correct) AS correct
    FROM attempts
    GROUP BY user_id
    ORDER BY best DESC, correct DESC
    LIMIT 10`).all()

  res.json(rows.map((r) => ({
    userId: r.user_id,
    name: r.user_name,
    best: r.best,
    average: r.average,
    quizzes: r.quizzes,
    correct: r.correct,
  })))
})

// Admin: manage questions
const checkQuestion = (body) => {
  if (!body.question || !body.category) return 'Question and category are required'
  if (!['easy', 'medium', 'hard'].includes(body.difficulty)) return 'Pick a difficulty'
  if (!Array.isArray(body.options) || body.options.length !== 4 || body.options.some((o) => !o)) {
    return 'Fill in all four options'
  }
  if (![0, 1, 2, 3].includes(Number(body.correctIndex))) return 'Pick the correct option'
  return null
}

// Values in the same order as the database columns
const questionValues = (body) => [
  String(body.category).trim(),
  body.difficulty,
  String(body.question).trim(),
  JSON.stringify(body.options.map((o) => String(o).trim())),
  Number(body.correctIndex),
]

const toQuestion = (row) => ({
  id: row.id,
  category: row.category,
  difficulty: row.difficulty,
  question: row.question,
  options: JSON.parse(row.options),
  correctIndex: row.correct_index,
})

app.get('/api/admin/questions', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM questions ORDER BY id DESC').all()
  res.json(rows.map(toQuestion))
})

app.post('/api/admin/questions', requireAdmin, (req, res) => {
  const problem = checkQuestion(req.body)
  if (problem) return res.status(400).json({ message: problem })

  const info = db.prepare(`INSERT INTO questions (category, difficulty, question, options, correct_index)
    VALUES (?, ?, ?, ?, ?)`).run(...questionValues(req.body))
  const row = db.prepare('SELECT * FROM questions WHERE id = ?').get(info.lastInsertRowid)
  res.json(toQuestion(row))
})

app.put('/api/admin/questions/:id', requireAdmin, (req, res) => {
  const problem = checkQuestion(req.body)
  if (problem) return res.status(400).json({ message: problem })

  const info = db.prepare(`UPDATE questions
    SET category = ?, difficulty = ?, question = ?, options = ?, correct_index = ?
    WHERE id = ?`).run(...questionValues(req.body), req.params.id)
  if (info.changes === 0) return res.status(404).json({ message: 'Question not found' })

  const row = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id)
  res.json(toQuestion(row))
})

app.delete('/api/admin/questions/:id', requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ message: 'Question not found' })
  res.json({ id: Number(req.params.id) })
})

// In production, the same server also serves the built frontend (the dist folder)
const distFolder = path.join(projectRoot, 'dist')
if (fs.existsSync(distFolder)) {
  app.use(express.static(distFolder))
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distFolder, 'index.html'))
    }
    next()
  })
}

app.use((req, res) => res.status(404).json({ message: 'Not found' }))

// eslint-disable-next-line no-unused-vars -- Express needs all four arguments for an error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Something went wrong on the server' })
})

app.listen(PORT, () => console.log(`QuizHub is running at http://localhost:${PORT}`))
