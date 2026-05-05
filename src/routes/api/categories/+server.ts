import { json } from '@sveltejs/kit'
import { jsonApiError } from '$lib/server/api-error'
import { deleteCategory, saveCategory } from '$lib/server/app-data'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const category = await request.json()
    saveCategory(locals.user, category)
    return json({ success: true })
  } catch (error) {
    return jsonApiError(error)
  }
}

export const DELETE: RequestHandler = async ({ request, locals }) => {
  try {
    const { id } = await request.json()
    deleteCategory(locals.user, id)
    return json({ success: true })
  } catch (error) {
    return jsonApiError(error)
  }
}
