import { json } from '@sveltejs/kit'
import { logEvent } from '$lib/logger'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ cookies, locals }) => {
  cookies.delete('alfredgo_session', { path: '/' })
  logEvent('info', 'auth.logout', { userId: locals.user?.id })
  return json({ success: true })
}
