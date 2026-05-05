import { json } from '@sveltejs/kit'
import { jsonApiError } from '$lib/server/api-error'
import { authenticateUser, logActivity } from '$lib/server/app-data'
import { createSessionCookie, sessionCookieOptions } from '$lib/server/auth'
import { checkRateLimit } from '$lib/server/rate-limit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  try {
    const { email, password } = await request.json()
    const normalizedEmail = String(email || '').trim().toLowerCase()
    checkRateLimit(`login:ip:${getClientAddress()}`, 20, 15 * 60 * 1000)
    checkRateLimit(`login:email:${normalizedEmail}`, 8, 15 * 60 * 1000)
    const user = authenticateUser(normalizedEmail, password)

    cookies.set('alfredgo_session', createSessionCookie(user.id), sessionCookieOptions)

    logActivity(user.id, 'login')
    return json(user)
  } catch (error) {
    return jsonApiError(error, 'Invalid email or password')
  }
}
