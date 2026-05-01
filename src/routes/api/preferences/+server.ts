import { json } from '@sveltejs/kit'
import { jsonApiError } from '$lib/server/api-error'
import { savePreference } from '$lib/server/app-data'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { userId: _ignoredUserId, ...prefs } = await request.json()
    savePreference(locals.user, prefs)
    return json({ success: true })
  } catch (error) {
    return jsonApiError(error)
  }
}
