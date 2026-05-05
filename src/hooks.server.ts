import type { Handle } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { users } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { seedIfEmpty } from '$lib/server/seed'
import type { User } from '$lib/types'
import { readSessionCookie } from '$lib/server/auth'

export const handle: Handle = async ({ event, resolve }) => {
  await seedIfEmpty()

  const sessionCookie = event.cookies.get('alfredgo_session')
  event.locals.user = null

  if (sessionCookie) {
    const session = readSessionCookie(sessionCookie)
    if (session?.userId) {
      const [user] = db.select().from(users).where(eq(users.id, session.userId)).all()
      if (user) {
        event.locals.user = user as User
      }
    }
  }

  const response = await resolve(event)
  response.headers.set('x-content-type-options', 'nosniff')
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin')
  response.headers.set('x-frame-options', 'DENY')
  response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('content-security-policy', "base-uri 'self'; frame-ancestors 'none'; object-src 'none'")
  return response
}
