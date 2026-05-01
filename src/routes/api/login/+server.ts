import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { userCredentials, users } from '$lib/server/schema'
import { verifyPassword } from '$lib/server/auth'
import { eq } from 'drizzle-orm'
import { logEvent } from '$lib/logger'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password } = await request.json()
  const normalizedEmail = email.trim().toLowerCase()

  const [credential] = db.select().from(userCredentials)
    .where(eq(userCredentials.email, normalizedEmail)).all()

  if (!credential || !verifyPassword(password, credential.passwordHash)) {
    logEvent('warn', 'auth.login_failed', { email: normalizedEmail })
    return json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const [user] = db.select().from(users).where(eq(users.id, credential.userId)).all()

  cookies.set('alfredgo_session', JSON.stringify({ userId: user.id }), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 60 * 60 * 8,
  })

  logEvent('info', 'auth.login_success', { userId: user.id, role: user.role })
  return json(user)
}
