import 'dotenv/config'
import cors from 'cors'
import crypto from 'node:crypto'
import express, { type NextFunction, type Request, type Response } from 'express'
import helmet from 'helmet'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'
import { z } from 'zod'
import db from './db.js'

const app = express()
const port = Number(process.env.PORT ?? 8787)
const jwtSecret = process.env.JWT_SECRET
const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.')
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
const octoShopId = process.env.OCTO_SHOP_ID
const octoSecret = process.env.OCTO_SECRET
const octoApiUrl = process.env.OCTO_API_URL ?? 'https://secure.octo.uz/prepare_payment'
const allowedOrigins = new Set(clientOrigin.split(',').map((origin) => origin.trim()))
const production = process.env.NODE_ENV === 'production'
const rateBuckets = new Map<string, { count: number; resetAt: number }>()

app.use(helmet())
app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)), credentials: true }))
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '256kb' }))

const rateLimit = (limit: number, windowMs: number) => (request: Request, response: Response, next: NextFunction) => {
  const key = `${request.ip}:${request.path}`
  const now = Date.now()
  const bucket = rateBuckets.get(key)
  if (!bucket || bucket.resetAt <= now) rateBuckets.set(key, { count: 1, resetAt: now + windowMs })
  else bucket.count += 1
  const current = rateBuckets.get(key)!
  if (current.count > limit) return response.status(429).json({ error: 'Too many requests. Please try again later.' })
  next()
}

const readCookie = (request: Request, name: string) => request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1)
const setSessionCookie = (response: Response, token: string) => response.setHeader('Set-Cookie', `arcway_session=${encodeURIComponent(token)}; HttpOnly; ${production ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=604800`)

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: 'student' | 'admin' }
}

const userFromToken = (token: string) => {
  const payload = jwt.verify(token, jwtSecret) as { sub: string; email: string; role: 'student' | 'admin' }
  return { id: payload.sub, email: payload.email, role: payload.role }
}

const requireAuth = (request: AuthRequest, response: Response, next: NextFunction) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '') ?? readCookie(request, 'arcway_session')
    if (!token) return response.status(401).json({ error: 'Authentication required.' })
    request.user = userFromToken(token)
    next()
  } catch {
    return response.status(401).json({ error: 'Invalid or expired session.' })
  }
}

const requireAdmin = (request: AuthRequest, response: Response, next: NextFunction) => {
  if (request.user?.role !== 'admin') return response.status(403).json({ error: 'Admin access required.' })
  next()
}

const authSchema = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128), fullName: z.string().trim().min(2).max(80).optional() })
const profileSchema = z.object({ fullName: z.string().trim().min(2).max(80), arcwayId: z.string().trim().regex(/^[a-z0-9._-]{3,32}$/) })

app.get('/api/health', (_request, response) => response.json({ ok: true, service: 'arcway-api', time: new Date().toISOString() }))

app.post('/api/auth/register', rateLimit(8, 15 * 60 * 1000), async (request, response) => {
  const parsed = authSchema.safeParse(request.body)
  if (!parsed.success || !parsed.data.fullName) return response.status(400).json({ error: 'Name, email, and an 8-character password are required.' })
  const email = parsed.data.email.toLowerCase()
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (exists) return response.status(409).json({ error: 'That email is already registered.' })
  const id = crypto.randomUUID()
  const role = email === adminEmail ? 'admin' : 'student'
  const arcwayId = `${parsed.data.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')}.${crypto.randomInt(100, 999)}`
  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  db.prepare('INSERT INTO users (id, email, password_hash, full_name, arcway_id, role) VALUES (?, ?, ?, ?, ?, ?)').run(id, email, passwordHash, parsed.data.fullName, arcwayId, role)
  return response.status(201).json({ message: 'Account created.' })
})

app.post('/api/auth/login', rateLimit(10, 15 * 60 * 1000), async (request, response) => {
  const parsed = authSchema.pick({ email: true, password: true }).safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ error: 'Valid email and password are required.' })
  const user = db.prepare('SELECT id, email, password_hash, role FROM users WHERE email = ?').get(parsed.data.email.toLowerCase()) as { id: string; email: string; password_hash: string; role: 'student' | 'admin' } | undefined
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password_hash))) return response.status(401).json({ error: 'Email or password is incorrect.' })
  const token = jwt.sign({ email: user.email, role: user.role }, jwtSecret, { subject: user.id, expiresIn: '7d' })
  setSessionCookie(response, token)
  return response.json({ user: { id: user.id, email: user.email, role: user.role } })
})

app.post('/api/auth/logout', (_request, response) => {
  response.setHeader('Set-Cookie', `arcway_session=; HttpOnly; ${production ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=0`)
  return response.status(204).end()
})

app.get('/api/me', requireAuth, (request: AuthRequest, response) => {
  const user = db.prepare('SELECT id, email, full_name AS fullName, arcway_id AS arcwayId, role, premium_status AS premiumStatus, premium_until AS premiumUntil, created_at AS createdAt FROM users WHERE id = ?').get(request.user?.id)
  return user ? response.json({ user }) : response.status(404).json({ error: 'User not found.' })
})

app.patch('/api/profile', requireAuth, (request: AuthRequest, response) => {
  const parsed = profileSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ error: 'Name and Arcway ID are invalid.' })
  try {
    db.prepare('UPDATE users SET full_name = ?, arcway_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(parsed.data.fullName, parsed.data.arcwayId, request.user?.id)
    return response.json({ message: 'Profile updated.' })
  } catch {
    return response.status(409).json({ error: 'That Arcway ID is already in use.' })
  }
})

app.get('/api/lessons', requireAuth, (_request, response) => response.json({ lessons: [
  { id: 'linear-equations', track: 'sat', title: 'Linear equations', progress: 72, unlocked: true },
  { id: 'quadratics', track: 'sat', title: 'Quadratic functions', progress: 18, unlocked: true },
  { id: 'data-probability', track: 'sat', title: 'Data and probability', progress: 0, unlocked: false, unlockAt: 90 },
]}))

app.get('/api/question-bank', requireAuth, (request, response) => {
  const query = z.object({ domain: z.string().max(80).optional(), skill: z.string().max(120).optional(), difficulty: z.enum(['easy', 'medium', 'hard']).optional() }).parse(request.query)
  const filters = ['1=1']
  const params: string[] = []
  if (query.domain) { filters.push('domain = ?'); params.push(query.domain) }
  if (query.skill) { filters.push('skill = ?'); params.push(query.skill) }
  if (query.difficulty) { filters.push('difficulty = ?'); params.push(query.difficulty) }
  const questions = db.prepare(`SELECT id, source_title AS sourceTitle, domain, skill, difficulty, prompt, choices, answer, explanation FROM question_bank WHERE ${filters.join(' AND ')} ORDER BY created_at DESC`).all(...params)
  return response.json({ questions })
})

app.get('/api/leaderboard', requireAuth, (request: AuthRequest, response) => {
  const parsed = z.object({ period: z.enum(['daily', 'weekly', 'monthly']).default('weekly') }).safeParse(request.query)
  if (!parsed.success) return response.status(400).json({ error: 'Period must be daily, weekly, or monthly.' })
  const modifier = parsed.data.period === 'daily' ? '-1 day' : parsed.data.period === 'weekly' ? '-7 days' : '-1 month'
  const rows = db.prepare(`SELECT u.id, u.full_name AS name, COALESCE(SUM(a.correct), 0) AS score, COUNT(a.id) AS attempts FROM users u LEFT JOIN practice_attempts a ON a.user_id = u.id AND a.created_at >= datetime('now', ?) GROUP BY u.id ORDER BY score DESC, attempts DESC, u.full_name ASC LIMIT 50`).all(modifier) as Array<{ id: string; name: string; score: number; attempts: number }>
  return response.json({ period: parsed.data.period, leaderboard: rows.map((row, index) => ({ rank: index + 1, id: row.id, name: row.id === request.user?.id ? 'You' : row.name, score: row.score, attempts: row.attempts })) })
})

app.get('/api/me/stats', requireAuth, (request: AuthRequest, response) => {
  const stats = db.prepare(`SELECT COALESCE(SUM(correct), 0) AS correct, COALESCE(SUM(total), 0) AS total, COALESCE(MAX(score), 0) AS personalBest, COUNT(*) AS attempts FROM practice_attempts WHERE user_id = ?`).get(request.user?.id) as { correct: number; total: number; personalBest: number; attempts: number }
  const today = db.prepare(`SELECT COALESCE(SUM(correct), 0) AS correct, COALESCE(SUM(total), 0) AS total FROM practice_attempts WHERE user_id = ? AND created_at >= datetime('now', '-1 day')`).get(request.user?.id) as { correct: number; total: number }
  return response.json({ today, personalBest: stats.personalBest, attempts: stats.attempts, accuracy: stats.total ? Math.round((stats.correct / stats.total) * 100) : 0 })
})

app.post('/api/admin/question-bank/import', requireAuth, requireAdmin, (request: AuthRequest, response) => {
  const questionSchema = z.object({ id: z.string().min(1).max(80), prompt: z.string().trim().min(10).max(10000), choices: z.array(z.string().max(500)).min(2).max(6).optional(), answer: z.string().max(500).optional(), explanation: z.string().max(5000).optional(), domain: z.string().trim().min(2).max(80), skill: z.string().trim().min(2).max(120), difficulty: z.enum(['easy', 'medium', 'hard']) })
  const payloadSchema = z.object({ sourceTitle: z.string().trim().min(2).max(200), sourceKind: z.enum(['licensed', 'user-owned', 'original']), licenseNote: z.string().trim().min(10).max(1000), questions: z.array(questionSchema).min(1).max(500) })
  const parsed = payloadSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ error: 'A source title, rights note, and valid questions are required.' })
  const insert = db.prepare('INSERT OR REPLACE INTO question_bank (id, source_title, source_kind, license_note, domain, skill, difficulty, prompt, choices, answer, explanation, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const transaction = db.transaction(() => { for (const question of parsed.data.questions) insert.run(question.id, parsed.data.sourceTitle, parsed.data.sourceKind, parsed.data.licenseNote, question.domain, question.skill, question.difficulty, question.prompt, JSON.stringify(question.choices ?? []), question.answer ?? null, question.explanation ?? null, request.user?.id) })
  transaction()
  return response.status(201).json({ imported: parsed.data.questions.length, source: parsed.data.sourceTitle })
})

app.post('/api/practice/attempts', requireAuth, (request: AuthRequest, response) => {
  const schema = z.object({ mode: z.enum(['topic', 'sprint', 'mock']), score: z.number().int().min(200).max(1600).optional(), correct: z.number().int().min(0), total: z.number().int().positive() })
  const parsed = schema.safeParse(request.body)
  if (!parsed.success || parsed.data.correct > parsed.data.total) return response.status(400).json({ error: 'Invalid practice result.' })
  const id = crypto.randomUUID()
  db.prepare('INSERT INTO practice_attempts (id, user_id, mode, score, correct, total) VALUES (?, ?, ?, ?, ?, ?)').run(id, request.user?.id, parsed.data.mode, parsed.data.score ?? null, parsed.data.correct, parsed.data.total)
  return response.status(201).json({ id })
})

app.post('/api/moderation/check', requireAuth, (request: AuthRequest, response: Response) => {
  const parsed = z.object({ message: z.string().trim().min(1).max(2000) }).safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ error: 'Message is required.' })
  const blocked = /\b(hate|terror|sexual|porn|weapon|kill)\b/i.test(parsed.data.message)
  if (blocked) {
    db.prepare('INSERT INTO moderation_events (id, user_id, action, reason) VALUES (?, ?, ?, ?)').run(crypto.randomUUID(), request.user?.id, 'blocked', 'Pre-publish content filter')
    return response.status(422).json({ allowed: false, warning: 'This message cannot be published. Please keep the discussion safe and age-appropriate.' })
  }
  return response.json({ allowed: true })
})

app.post('/api/billing/checkout', requireAuth, async (request: AuthRequest, response: Response) => {
  const user = request.user!
  if (octoShopId && octoSecret) {
    const transactionId = crypto.randomUUID()
    const returnUrl = `${process.env.OCTO_RETURN_URL ?? clientOrigin}/?billing=complete&transaction=${transactionId}`
    const notifyUrl = process.env.OCTO_NOTIFY_URL ?? `${process.env.API_PUBLIC_URL ?? `http://localhost:${port}`}/api/billing/octo/notify`
    const octoResponse = await fetch(octoApiUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      octo_shop_id: Number(octoShopId), octo_secret: octoSecret, shop_transaction_id: transactionId,
      auto_capture: true, test: process.env.OCTO_TEST_MODE === 'true', init_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
      user_data: { user_id: user.id, email: user.email }, total_sum: 4.99, currency: 'USD', description: 'Arcway Premium monthly subscription',
      payment_methods: [{ method: 'bank_card' }, { method: 'uzcard' }, { method: 'humo' }], return_url: returnUrl, notify_url: notifyUrl, language: 'en', ttl: 15,
    }) })
    if (!octoResponse.ok) return response.status(502).json({ error: 'Payment provider is unavailable.' })
    const octoPayload = await octoResponse.json() as { error?: number; errMessage?: string; data?: { octo_pay_url?: string; octo_payment_UUID?: string } }
    if (octoPayload.error || !octoPayload.data?.octo_pay_url) return response.status(502).json({ error: octoPayload.errMessage ?? 'Unable to create payment.' })
    db.prepare('INSERT INTO billing_events (id, user_id, provider_event_id, event_type, payload) VALUES (?, ?, ?, ?, ?)').run(crypto.randomUUID(), user.id, transactionId, 'octo.checkout.created', JSON.stringify({ paymentUUID: octoPayload.data.octo_payment_UUID }))
    return response.json({ provider: 'octo', url: octoPayload.data.octo_pay_url, transactionId })
  }
  if (!stripe || !process.env.STRIPE_PRICE_ID) return response.status(503).json({ error: 'Billing is not configured yet.' })
  const priceId = process.env.STRIPE_PRICE_ID
  const session = await stripe.checkout.sessions.create({ mode: 'subscription', line_items: [{ price: priceId, quantity: 1 }], customer_email: user.email, success_url: `${clientOrigin}/?billing=success`, cancel_url: `${clientOrigin}/?billing=cancelled`, metadata: { userId: user.id } })
  return response.json({ url: session.url })
})

app.post('/api/billing/octo/notify', (request, response) => {
  const notification = request.body as { shop_transaction_id?: string; status?: string; octo_payment_UUID?: string; user_id?: string }
  if (!notification.shop_transaction_id || !notification.status) return response.status(400).json({ status: 'error', message: 'Invalid notification.' })
  const event = db.prepare('SELECT user_id FROM billing_events WHERE provider_event_id = ?').get(notification.shop_transaction_id) as { user_id: string } | undefined
  if (!event) return response.status(404).json({ status: 'error', message: 'Unknown transaction.' })
  db.prepare('INSERT OR IGNORE INTO billing_events (id, user_id, provider_event_id, event_type, payload) VALUES (?, ?, ?, ?, ?)').run(crypto.randomUUID(), event.user_id, `${notification.shop_transaction_id}:${notification.status}`, `octo.${notification.status}`, JSON.stringify(notification))
  if (notification.status === 'succeeded') db.prepare("INSERT INTO subscriptions (user_id, provider, provider_customer_ref, status, current_period_end) VALUES (?, 'octo', ?, 'active', datetime('now', '+30 days')) ON CONFLICT(user_id) DO UPDATE SET status = 'active', current_period_end = datetime('now', '+30 days'), updated_at = CURRENT_TIMESTAMP").run(event.user_id, notification.octo_payment_UUID ?? null)
  return response.json({ status: 'success', message: 'Callback processed successfully' })
})

app.post('/api/billing/webhook', (request, response) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return response.status(503).send('Billing is not configured.')
  try {
    const event = stripe.webhooks.constructEvent(request.body, request.headers['stripe-signature'] as string, process.env.STRIPE_WEBHOOK_SECRET)
    const object = event.data.object as { metadata?: { userId?: string }; customer_email?: string }
    const userId = object.metadata?.userId
    if (userId) db.prepare('INSERT OR IGNORE INTO billing_events (id, user_id, provider_event_id, event_type, payload) VALUES (?, ?, ?, ?, ?)').run(crypto.randomUUID(), userId, event.id, event.type, JSON.stringify(event.data.object))
    return response.json({ received: true })
  } catch {
    return response.status(400).send('Invalid webhook signature.')
  }
})

app.get('/api/admin/overview', requireAuth, requireAdmin, (_request, response) => {
  const users = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }
  const attempts = db.prepare('SELECT COUNT(*) AS count FROM practice_attempts').get() as { count: number }
  return response.json({ users: users.count, attempts: attempts.count })
})

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error)
  return response.status(500).json({ error: 'Unexpected server error.' })
})

app.listen(port, () => console.log(`Arcway API listening on http://localhost:${port}`))
