import { json } from '@sveltejs/kit'
import { jsonApiError } from '$lib/server/api-error'
import { authenticateUser, logActivity } from '$lib/server/app-data'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json()
    const user = authenticateUser(email, password)

    cookies.set('alfredgo_session', JSON.stringify({ userId: user.id }), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 8,
    })

    logActivity(user.id, 'login')
    return json(user)
  } catch (error) {
    return jsonApiError(error, 'Invalid email or password')
  }
}
