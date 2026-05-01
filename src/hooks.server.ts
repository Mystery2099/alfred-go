import type { Handle } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { users } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { seedIfEmpty } from '$lib/server/seed'
import type { User } from '$lib/types'

export const handle: Handle = async ({ event, resolve }) => {
  await seedIfEmpty()

  const sessionCookie = event.cookies.get('alfredgo_session')
  event.locals.user = null

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie)
      if (session?.userId) {
        const [user] = db.select().from(users).where(eq(users.id, session.userId)).all()
        if (user) {
          event.locals.user = user as User
        }
      }
    } catch {
      // invalid session cookie
    }
  }

  return resolve(event)
}
