import { json } from '@sveltejs/kit'
import { logEvent } from '$lib/logger'
import { deleteSession } from '$lib/server/session'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ cookies, locals }) => {
  const sessionCookie = cookies.get('alfredgo_session')
  if (sessionCookie) deleteSession(sessionCookie)
  cookies.delete('alfredgo_session', { path: '/' })
  logEvent('info', 'auth.logout', { userId: locals.user?.id })
  return json({ success: true })
}
