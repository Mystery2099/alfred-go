import { createHash, randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { userSessions } from './schema'
import { sessionMaxAgeSeconds } from './auth'

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + sessionMaxAgeSeconds * 1000)

  db.insert(userSessions).values({
    id: `session-${randomBytes(12).toString('hex')}`,
    userId,
    tokenHash: hashToken(token),
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  }).run()

  return token
}

export function readSession(token: string): { userId: string } | null {
  const [session] = db.select().from(userSessions).where(eq(userSessions.tokenHash, hashToken(token))).all()
  if (!session) return null

  if (Date.parse(session.expiresAt) <= Date.now()) {
    deleteSession(token)
    return null
  }

  return { userId: session.userId }
}

export function deleteSession(token: string) {
  db.delete(userSessions).where(eq(userSessions.tokenHash, hashToken(token))).run()
}
