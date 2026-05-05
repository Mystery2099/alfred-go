import { error, type Handle } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { users } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { seedIfEmpty } from '$lib/server/seed'
import type { User } from '$lib/types'
import { readSession } from '$lib/server/session'

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS'])

function assertSameOriginRequest(event: Parameters<Handle>[0]['event']) {
  if (safeMethods.has(event.request.method)) return

  const contentLength = Number(event.request.headers.get('content-length') || 0)
  if (contentLength > 100_000) error(413, 'Request too large')

  const origin = event.request.headers.get('origin')
  if (origin && origin !== event.url.origin) error(403, 'Forbidden')

  const fetchSite = event.request.headers.get('sec-fetch-site')
  if (fetchSite === 'cross-site') error(403, 'Forbidden')
}

export const handle: Handle = async ({ event, resolve }) => {
  await seedIfEmpty()
  assertSameOriginRequest(event)

  const sessionCookie = event.cookies.get('alfredgo_session')
  event.locals.user = null

  if (sessionCookie) {
    const session = readSession(sessionCookie)
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
