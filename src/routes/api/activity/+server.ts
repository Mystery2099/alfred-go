import { json } from '@sveltejs/kit'
import { jsonApiError } from '$lib/server/api-error'
import { logActivity } from '$lib/server/app-data'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const user = locals.user
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 })
    const { type, toolId, toolName } = await request.json()
    logActivity(user.id, type, toolId ? String(toolId) : undefined, toolName ? String(toolName) : undefined)
    return json({ success: true })
  } catch (error) {
    return jsonApiError(error)
  }
}
