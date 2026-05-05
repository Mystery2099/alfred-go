import { json } from '@sveltejs/kit'
import { jsonApiError } from '$lib/server/api-error'
import { authenticateUser, logActivity } from '$lib/server/app-data'
import { createSessionCookie, sessionCookieOptions } from '$lib/server/auth'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json()
    const user = authenticateUser(email, password)

    cookies.set('alfredgo_session', createSessionCookie(user.id), sessionCookieOptions)

    logActivity(user.id, 'login')
    return json(user)
  } catch (error) {
    return jsonApiError(error, 'Invalid email or password')
  }
}
