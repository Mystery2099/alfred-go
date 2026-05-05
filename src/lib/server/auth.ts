import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto'
import type { Role } from '../types'

const iterations = 120000
const keyLength = 32
const digest = 'sha256'
const sessionMaxAgeSeconds = 60 * 60 * 8

const sessionSecret = process.env.SESSION_SECRET || (
  process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('SESSION_SECRET is required in production') })()
    : 'alfredgo-local-session-secret-change-me'
)

export type TestAccount = {
  userId: string
  email: string
  password: string
  role: Role
}

export const testAccounts: TestAccount[] = [
  { userId: 'user-applicant', email: 'applicant@alfredgo.local', password: 'ApplicantGo2026!', role: 'applicant' },
  { userId: 'user-accepted_student', email: 'accepted.student@alfredgo.local', password: 'AcceptedGo2026!', role: 'accepted_student' },
  { userId: 'user-student', email: 'student@alfredgo.local', password: 'StudentGo2026!', role: 'student' },
  { userId: 'user-staff', email: 'staff@alfredgo.local', password: 'StaffGo2026!', role: 'staff' },
  { userId: 'user-admin', email: 'admin@alfredgo.local', password: 'AdminGo2026!', role: 'admin' },
]

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString('hex')
  return `pbkdf2:${digest}:${iterations}:${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, hashDigest, hashIterations, salt, hash] = storedHash.split(':')
  if (scheme !== 'pbkdf2' || !hashDigest || !hashIterations || !salt || !hash) return false

  const candidate = pbkdf2Sync(password, salt, Number(hashIterations), keyLength, hashDigest).toString('hex')
  const stored = Buffer.from(hash, 'hex')
  const computed = Buffer.from(candidate, 'hex')
  return stored.length === computed.length && timingSafeEqual(stored, computed)
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(value: string) {
  return createHmac('sha256', sessionSecret).update(value).digest('base64url')
}

function equalSignature(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}

export function createSessionCookie(userId: string) {
  const payload = base64UrlEncode(JSON.stringify({
    userId,
    exp: Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds,
  }))
  return `${payload}.${sign(payload)}`
}

export function readSessionCookie(cookie: string): { userId: string } | null {
  const [payload, signature] = cookie.split('.')
  if (!payload || !signature || !equalSignature(signature, sign(payload))) return null

  try {
    const session = JSON.parse(base64UrlDecode(payload))
    if (!session?.userId || !session?.exp || Date.now() / 1000 > session.exp) return null
    return { userId: String(session.userId) }
  } catch {
    return null
  }
}

export const sessionCookieOptions = {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: sessionMaxAgeSeconds,
} as const
