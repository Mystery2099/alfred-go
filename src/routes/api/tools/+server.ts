import { json } from '@sveltejs/kit'
import { jsonApiError } from '$lib/server/api-error'
import { deleteTool, saveTool } from '$lib/server/app-data'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const tool = await request.json()
    saveTool(locals.user, tool)
    return json({ success: true })
  } catch (error) {
    return jsonApiError(error)
  }
}

export const DELETE: RequestHandler = async ({ request, locals }) => {
  try {
    const { id } = await request.json()
    deleteTool(locals.user, id)
    return json({ success: true })
  } catch (error) {
    return jsonApiError(error)
  }
}
