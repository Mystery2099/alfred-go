import { json } from '@sveltejs/kit'
import { jsonApiError } from '$lib/server/api-error'
import { addFavorite, removeFavorite } from '$lib/server/app-data'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { toolId } = await request.json()
    addFavorite(locals.user, toolId)
    return json({ success: true })
  } catch (error) {
    return jsonApiError(error)
  }
}

export const DELETE: RequestHandler = async ({ request, locals }) => {
  try {
    const { toolId } = await request.json()
    removeFavorite(locals.user, toolId)
    return json({ success: true })
  } catch (error) {
    return jsonApiError(error)
  }
}
